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
  
  // Security headers
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    // Strict CSP since this is a JSON-only API with no browser rendering
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  });
  
  // Make JSON body size limit configurable via environment variable, defaulting to 5mb
  const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '5mb';
  app.use(express.json({ limit: jsonBodyLimit })); // Limit payload size

  // --- 1. Create Dependencies (Dependency Injection) ---

  // The qBitClient is the core dependency for tools
  const qbitClient = new QBitClient(
    config.qbit.baseUrl,
    config.qbit.username,
    config.qbit.password,
    config.qbit.timeout
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
    try {
      const rpcRequest = req.body;

      // Delegate all processing to the handler
      const rpcResponse = await rpcHandler.handleRequest(rpcRequest);

      if (rpcResponse) {
        res.status(200).json(rpcResponse);
      } else {
        // Per JSON-RPC spec, notifications (no 'id') get no response
        res.status(204).send();
      }
    } catch (error) {
      console.error('[App] Unexpected error in /rpc handler:', error.message);
      res.status(500).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal server error',
          data: process.env.NODE_ENV !== 'production' ? error.message : null,
        },
      });
    }
  });

  /**
   * Standard health check endpoint.
   */
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  /**
   * Global error handler for Express
   */
  app.use((err, req, res, next) => {
    console.error('[App] Unhandled error:', err.message);
    
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: process.env.NODE_ENV !== 'production' ? 'Invalid JSON format' : undefined,
        },
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  });

  return app;
}

module.exports = { createApp };