// Author: Jacques Murray

const { McpTool } = require('../McpTool');
const { z } = require('zod');

// Zod schema for input validation
const AddTorrentInputSchema = z.object({
  url: z.string()
    .min(1, 'URL cannot be empty')
    .url('Invalid URL. Must be a valid magnet link or .torrent URL.')
    .refine(
      (url) => url.startsWith('magnet:') || url.startsWith('http://') || url.startsWith('https://'),
      { message: 'URL must be a magnet link or HTTP/HTTPS URL' }
    ),
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
   * @param {z.infer<typeof AddTorrentInputSchema>} args
   * @returns {Promise<object>} Success status and message
   */
  async execute(args) {
    const { url } = args;
    console.log(`[AddTorrentTool] Adding torrent from URL: ${url.substring(0, 50)}...`);

    const success = await this.qbitClient.addTorrent(url);

    const result = {
      success: success,
      message: success ? 'Torrent added successfully.' : 'Failed to add torrent.',
    };

    console.log(`[AddTorrentTool] Result: ${result.message}`);
    return result;
  }
}

module.exports = { AddTorrentTool };