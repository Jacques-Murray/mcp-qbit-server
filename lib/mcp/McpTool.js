// Author: Jacques Murray

/**
 * Abstract base class (interface) for an MCP Tool.
 * All concrete tools must extend this class.
 */
class McpTool {
  constructor() {
    if (this.constructor === McpTool) {
      throw new Error("Abstract class 'McpTool' cannot be instantiated directly.");
    }
  }

  /**
   * The unique name of the tool (e.g., 'qbit/getTorrents').
   * @type {string}
   */
  get name() {
    throw new Error("Method 'name' must be implemented.");
  }

  /**
   * A human-readable description of what the tool does.
   * @type {string}
   */
  get description() {
    throw new Error("Method 'description' must be implemented.");
  }

  /**
   * A Zod schema object for validating the input arguments.
   * @type {import('zod').ZodObject}
   */
  get inputSchema() {
    throw new Error("Method 'inputSchema' must be implemented.");
  }

  /**
   * The main execution logic of the tool.
   * @param {object} args - The validated arguments.
   * @returns {Promise<any>} The serializable output of the tool.
   */
  async execute(args) {
    throw new Error("Method 'execute' must be implemented.");
  }
}

module.exports = { McpTool };