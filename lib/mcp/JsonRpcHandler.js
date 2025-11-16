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
   * Handles a single JSON-RPC request object.
   * @private
   * @param {Record<string, any>} request
   * @returns {Promise<object | null>}
   */
  async #handleSingleRequest(request) {
    const { id, method, params, jsonrpc } = request;

    if (jsonrpc !== '2.0') {
      return this.#createErrorResponse(id ?? null, -32600, 'Invalid Request', 'Invalid JSON-RPC version.');
    }
    if (typeof method !== 'string') {
      return this.#createErrorResponse(id ?? null, -32600, 'Invalid Request', 'Method must be a string.');
    }

    const handlerMethod = this.dispatch[method];
    if (!handlerMethod) {
      return this.#createErrorResponse(id ?? null, -32601, `Method '${method}' not found.`);
    }

    try {
      const result = await handlerMethod(params || {});
      const hasId = Object.prototype.hasOwnProperty.call(request, 'id');

      if (hasId && id !== undefined) {
        return {
          jsonrpc: '2.0',
          id,
          result,
        };
      }

      return null;
    } catch (error) {
      console.error(`[RpcHandler] Internal Error in method '${method}':`, error);
      const errorData = process.env.NODE_ENV !== 'production' ? error.message : null;
      return this.#createErrorResponse(id ?? null, -32603, 'Internal error', errorData);
    }
  }

  /**
   * Main entry point for handling a raw RPC request body.
   * @param {object | Array<any>} body The raw, parsed JSON object from the request.
   * @returns {Promise<object | object[] | null>} A response body or null for notifications only.
   */
  async handleRequest(body) {
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return this.#createErrorResponse(null, -32600, 'Invalid Request', 'Batch request cannot be empty.');
      }

      const responses = await Promise.all(body.map((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          return Promise.resolve(this.#createErrorResponse(null, -32600, 'Invalid Request', 'Batch entries must be objects.'));
        }
        return this.#handleSingleRequest(entry);
      }));

      const filtered = responses.filter((response) => response !== null);
      return filtered.length > 0 ? filtered : null;
    }

    if (!body || typeof body !== 'object') {
      return this.#createErrorResponse(null, -32600, 'Invalid Request', 'Request body must be a JSON object or array.');
    }

    return this.#handleSingleRequest(body);
  }
}

module.exports = { JsonRpcHandler };