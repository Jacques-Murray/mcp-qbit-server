// Author: Jacques Murray

/**
 * A simple OOP registry for discovering and holding McpTool instances.
 */
class ToolRegistry {
  constructor() {
    /** @type {Map<string, McpTool>} */
    this.tools = new Map();
  }

  /**
   * Registers a tool instance.
   * @param {McpTool} tool An object that inherits from McpTool.
   */
  registerTool(tool) {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Overwriting tool: ${tool.name}`);
    }
    console.log(`[ToolRegistry] Registering tool: ${tool.name}`);
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves a tool by its unique name.
   * @param {string} name The name of the tool to find.
   * @returns {McpTool | undefined} The McpTool instance or undefined.
   */
  getTool(name) {
    return this.tools.get(name);
  }
}

module.exports = { ToolRegistry };