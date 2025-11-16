// Author: Jacques Murray

/**
 * Application Composition Root.
 * This file creates all services and injects dependencies,
 * decoupling the server logic from the modules.
 * This makes the application highly testable.
 */
const express = require('express');
const config = require('./config');

// Import all service classes
const { QBitClient } = require('./lib/qbit/QBitClient');
const { ToolRegistry } = require('./lib/mcp/ToolRegistry');
const { ToolService } = require('./lib/mcp/ToolService');
const { JsonRpcHandler } = require('./lib/mcp/JsonRpcHandler');

// Import all tool classes
const { GetTorrentsTool } = require('./lib/mcp/tools/GetTorrentsTool');
const { AddTorrentTool } = require('./lib/mcp/tools/AddTorrentTool');

/**
 * Creates and configures the Express application.
 * @returns {express.Application} The configured Express app.
 */
function createApp() {
  const app = express();
  app.use(express.json());

  // --- 1. Create Dependencies (Dependency Injection) ---

  // The qBitClient is the core dependency for tools
  const qbitClient = new QBitClient(
    config.qbit.baseUrl,
    config.qbit.username,
    config.qbit.password
  );

  // The ToolRegistry holds all available tools
  const toolRegistry = new ToolRegistry();

  // Register tools, injecting the client
  toolRegistry.registerTool(new GetTorrentsTool(qbitClient));
  toolRegistry.registerTool(new AddTorrentTool(qbitClient));

  // The ToolService uses the registry
  const toolService = new ToolService(toolRegistry);

  // The RpcHandler uses the toolService
  const rpcHandler = new JsonRpcHandler(toolService);

  // --- 2. Wire Endpoints ---

  /**
   * Main JSON-RPC 2.0 endpoint.
   */
  app.post('/rpc', async (req, res) => {
    const rpcRequest = req.body;

    // Delegate all processing to the handler
    const rpcResponse = await rpcHandler.handleRequest(rpcRequest);

    if (rpcResponse) {
      res.status(200).json(rpcResponse);
    } else {
      // Per JSON-RPC spec, notifications (no 'id') get no response
      res.status(204).send();
    }
  });

  /**
   * Standard health check endpoint.
   */
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}

module.exports = { createApp };