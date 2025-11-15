// Author: Jacques Murray

/**
 * Handles parsing, validation, and dispatching of JSON-RPC 2.0 requests.
 * Decouples the Express transport layer from the MCP application logic.
 */
class JsonRpcHandler {
  /**
   * @param {import('./ToolService').ToolService} toolService
   */
  constructor(toolService) {
    // Map of method names to the service methods that handle them
    this.dispatch = {
      'tools/call': toolService.callTool.bind(toolService),
      // 'mcp/listTools': ... // Stub for future implementation
    };
  }

  /**
   * Creates a JSON-RPC 2.0 Error Response object.
   * @private
   */
  #createErrorResponse(id, code, message, data = null) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message, data },
    };
  }

  /**
   * Main entry point for handling a raw RPC request body.
   * @param {object} body The raw, parsed JSON object from the request.
   * @returns {Promise<object | null>} A response object or null for notifications.
   */
  async handleRequest(body) {
    const { id, method, params, jsonrpc } = body;

    // 1. Basic protocol validation
    if (jsonrpc !== '2.0') {
      return this.#createErrorResponse(id || null, -32600, 'Invalid Request', 'Invalid JSON-RPC version.');
    }
    if (typeof method !== 'string') {
      return this.#createErrorResponse(id || null, -32600, 'Invalid Request', 'Method must be a string.');
    }

    // 2. Find the method handler
    const handlerMethod = this.dispatch[method];
    if (!handlerMethod) {
      return this.#createErrorResponse(id || null, -32601, 'Method not found', `Method '${method}' not found.`);
    }

    // 3. Call the appropriate service method
    try {
      const result = await handlerMethod(params || {});

      // 4. Formulate the success response (only if 'id' was present)
      if (id) {
        return {
          jsonrpc: '2.0',
          id,
          result,
        };
      }
      return null; // It was a notification
    } catch (error) {
      // 5. Handle internal errors
      console.error(`[RpcHandler] Internal Error in method '${method}':`, error);
      return this.#createErrorResponse(id || null, -32603, 'Internal error', error.message);
    }
  }
}

module.exports = { JsonRpcHandler };