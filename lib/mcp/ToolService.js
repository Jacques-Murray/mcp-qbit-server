// Author: Jacques Murray

const { z } = require('zod');

/**
 * Validates the parameters for the 'tools/call' method itself.
 * This ensures 'name' and 'arguments' fields are present.
 */
const ToolCallParamsSchema = z.object({
  name: z.string({
    required_error: "Tool 'name' is required",
  }),
  arguments: z.object({}, {
    required_error: "Tool 'arguments' is required",
  }).passthrough(), // Allows any properties inside 'arguments'
});

/**
 * Implements the 'tools/call' method logic.
 * This class orchestrates fetching the tool from the registry
 * and executing it with the provided arguments.
 */
class ToolService {
  /**
   * @param {import('./ToolRegistry').ToolRegistry} toolRegistry
   */
  constructor(toolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  /**
   * A helper to create a standardized tool error response.
   * @private
   * @param {string} message Error message
   * @param {any} [data] Optional error data
   * @returns {object}
   */
  #createToolErrorResult(message, data = null) {
    return {
      isError: true,
      message,
      data,
    };
  }

  /**
   * Implements the 'tools/call' method.
   * @param {object} params The raw 'params' object from the RPC request.
   * @returns {Promise<object>} A ToolCallResult or ToolCallErrorResult object.
   */
  async callTool(params) {
    // 1. Validate the 'tools/call' params structure
    const paramsValidation = ToolCallParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return this.#createToolErrorResult(
        "Invalid 'tools/call' parameters.",
        paramsValidation.error.format()
      );
    }

    const { name, arguments: args } = paramsValidation.data;

    // 2. Find the tool in the registry
    const tool = this.toolRegistry.getTool(name);
    if (!tool) {
      return this.#createToolErrorResult(`Tool '${name}' not found.`);
    }

    // 3. Execute the tool
    try {
      // 3a. Validate the tool's *own* arguments using its schema
      const validatedArgs = tool.inputSchema.parse(args);

      // 3b. Run the tool's logic
      const content = await tool.execute(validatedArgs);

      // 4. Return the successful result
      return {
        isError: false,
        content,
      };
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        console.warn(`[ToolService] Invalid arguments for tool '${name}':`, error.format());
        return this.#createToolErrorResult(
          `Invalid arguments for tool '${name}'.`,
          error.format()
        );
      }

      // Handle general execution errors
      console.error(`[ToolService] Error executing tool '${name}':`, error);
      const data = process.env.NODE_ENV !== 'production' ? error.message : null;
      return this.#createToolErrorResult(
        `Tool '${name}' failed.`,
        data
      );
    }
  }
}

module.exports = { ToolService };