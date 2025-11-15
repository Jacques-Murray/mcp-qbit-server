// Author: Jacques Murray

const { McpTool } = require('../McpTool');
const { z } = require('zod');

// Zod schema for input validation
const AddTorrentInputSchema = z.object({
  url: z.string().url('Invalid URL. Must be a valid magnet link or .torrent URL.'),
});

/**
 * Tool to add a new torrent to qBittorrent via URL.
 */
class AddTorrentTool extends McpTool {
  /**
   * @param {import('../../qbit/QBitClient').QBitClient} qbitClient
   */
  constructor(qbitClient) {
    super();
    this.qbitClient = qbitClient;
  }

  get name() {
    return 'qbit/addTorrent';
  }

  get description() {
    return 'Adds a new torrent to qBittorrent using a magnet link or a URL to a .torrent file.';
  }

  get inputSchema() {
    return AddTorrentInputSchema;
  }

  /**
   * @param {z.infer<AddTorrentInputSchema>} args
   */
  async execute(args) {
    const { url } = args;
    console.log(`[AddTorrentTool] Adding torrent from URL: ${url}`);

    const success = await this.qbitClient.addTorrent(url);

    return {
      success: success,
      message: success ? 'Torrent added successfully.' : 'Failed to add torrent.',
    };
  }
}

module.exports = { AddTorrentTool };