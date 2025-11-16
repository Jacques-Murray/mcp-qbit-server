// Author: Jacques Murray

/**
 * Main application entry point.
 * This file is responsible for creating and starting the server.
 * All application setup (dependency injection) is handled in app.js.
 */
const { createApp } = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`[MCP-QBIT] Server running on http://localhost:${config.port}`);
  console.log(`[MCP-QBIT] RPC Endpoint: http://localhost:${config.port}/rpc`);
  console.log(`[MCP-QBIT] Health Check: http://localhost:${config.port}/health`);
});