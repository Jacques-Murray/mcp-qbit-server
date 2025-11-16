// Author: Jacques Murray

const request = require('supertest');
const { createApp } = require('../app');
const { QBitClient } = require('../lib/qbit/QBitClient');

// --- Mock the QBitClient ---
// We mock the entire module
jest.mock('../lib/qbit/QBitClient');

// Prepare mock functions for the client's methods
const mockGetTorrents = jest.fn();
const mockAddTorrent = jest.fn();

// This implementation will be used by Jest for the 'new QBitClient()' call in app.js
QBitClient.mockImplementation(() => {
  return {
    getTorrents: mockGetTorrents,
    addTorrent: mockAddTorrent,
  };
});
// -------------------------

// Create the app with mocked dependencies
const app = createApp();

// Helper to create RPC requests
const createRpcRequest = (method, params) => ({
  jsonrpc: '2.0',
  id: 1,
  method,
  params,
});

describe('MCP Server (qBittorrent)', () => {

  beforeEach(() => {
    // Reset mocks before each test
    mockGetTorrents.mockReset();
    mockAddTorrent.mockReset();
  });

  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should return RPC error for invalid JSON', async () => {
    const res = await request(app)
      .post('/rpc')
      .send('not json')
      .set('Content-Type', 'application/json');

    // Express JSON parser error
    expect(res.statusCode).toBe(400);
  });

  it('should return RPC error for method not found', async () => {
    const rpcRequest = createRpcRequest('nonexistent/method', {});
    const res = await request(app).post('/rpc').send(rpcRequest);

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe(-32601); // Method not found
    expect(res.body.error.message).toContain('nonexistent/method');
  });

  describe('tools/call: qbit/getTorrents', () => {
    it('should successfully call getTorrents and return simplified results', async () => {
      // Mock the client's response
      const mockTorrentData = [
        { name: 'test.iso', hash: '123', size: 1000, progress: 1, state: 'seeding', eta: 0 },
        { name: 'test.mp4', hash: '456', size: 500, progress: 0.5, state: 'downloading', eta: 3600 },
      ];
      mockGetTorrents.mockResolvedValue(mockTorrentData);

      const rpcRequest = createRpcRequest('tools/call', {
        name: 'qbit/getTorrents',
        arguments: { filter: 'all' },
      });

      const res = await request(app).post('/rpc').send(rpcRequest);

      // Check RPC success
      expect(res.statusCode).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.result.isError).toBe(false);

      // Check that the mock was called correctly
      expect(mockGetTorrents).toHaveBeenCalledTimes(1);
      expect(mockGetTorrents).toHaveBeenCalledWith('all', undefined);

      // Check that the tool simplified the data
      expect(res.body.result.content).toHaveLength(2);
      expect(res.body.result.content[0].name).toBe('test.iso');
      expect(res.body.result.content[1].progress).toBe(0.5);
    });

    it('should return a tool error for invalid arguments', async () => {
      const rpcRequest = createRpcRequest('tools/call', {
        name: 'qbit/getTorrents',
        arguments: { filter: 123 }, // 'filter' should be a string
      });

      const res = await request(app).post('/rpc').send(rpcRequest);

      expect(res.statusCode).toBe(200);
      expect(res.body.error).toBeUndefined(); // The RPC call succeeded
      expect(res.body.result.isError).toBe(true); // The *tool* failed
      expect(res.body.result.message).toContain('Invalid argument');
      expect(res.body.data._errors).toBeDefined(); // Zod error data

      // Ensure the client was not called
      expect(mockGetTorrents).not.toHaveBeenCalled();
    });
  });

  describe('tools/call: qbit/addTorrent', () => {
    it('should successfully call addTorrent', async () => {
      mockAddTorrent.mockResolvedValue(true); // API returns 'Ok.'
      const magnetUrl = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d83176f01c045d93a6da';

      const rpcRequest = createRpcRequest('tools/call', {
        name: 'qbit/addTorrent',
        arguments: { url: magnetUrl },
      });

      const res = await request(app).post('/rpc').send(rpcRequest);

      expect(res.statusCode).toBe(200);
      expect(res.body.result.isError).toBe(false);
      expect(res.body.result.content.success).toBe(true);

      // Check that the mock was called
      expect(mockAddTorrent).toHaveBeenCalledTimes(1);
      expect(mockAddTorrent).toHaveBeenCalledWith(magnetUrl);
    });

    it('should return a tool error for an invalid URL', async () => {
      const rpcRequest = createRpcRequest('tools/call', {
        name: 'qbit/addTorrent',
        arguments: { url: 'not_a_url' }, // Invalid URL
      });

      const res = await request(app).post('/rpc').send(rpcRequest);

      expect(res.statusCode).toBe(200);
      expect(res.body.result.isError).toBe(true);
      expect(res.body.result.message).toContain('Invalid argument');
      expect(res.body.data._errors).toBeDefined();

      // Ensure the client was not called
      expect(mockAddTorrent).not.toHaveBeenCalled();
    })
  });
});