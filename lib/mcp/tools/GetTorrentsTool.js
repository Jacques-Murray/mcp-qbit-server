// Author: Jacques Murray

const { McpTool } = require('../McpTool');
const { z } = require('zod');

// Zod schema for input validation
const GetTorrentsInputSchema = z.object({
  filter: z.string().optional().refine(
    (val) => !val || val.trim().length > 0,
    { message: 'Filter must not be an empty string if provided' }
  ),
});

/**
 * Tool to get a list of torrents from qBittorrent.
 */
class GetTorrentsTool extends McpTool {
  /**
   * @param {import('../../qbit/QBitClient').QBitClient} qbitClient
   */
  constructor(qbitClient) {
    super();
    this.qbitClient = qbitClient;
  }

  get name() {
    return 'qbit/getTorrents';
  }

  get description() {
    return 'Lists torrents from qBittorrent using the qBittorrent filter values (e.g., "all", "downloading", "seeding").';
  }

  get inputSchema() {
    return GetTorrentsInputSchema;
  }

  /**
   * @param {z.infer<typeof GetTorrentsInputSchema>} args
   * @returns {Promise<Array<object>>} Simplified torrent information
   */
  async execute(args) {
    const { filter } = args;
    console.log(`[GetTorrentsTool] Executing with filter=${filter || 'none'}`);

    // The client handles the actual API call
    const torrents = await this.qbitClient.getTorrents(filter);

    // Ensure we received an array
    if (!Array.isArray(torrents)) {
      console.warn('[GetTorrentsTool] Unexpected response format from qBittorrent API');
      return [];
    }

    // For brevity, we can return a subset of information
    const simplifiedTorrents = torrents.map(t => ({
      name: t.name || 'Unknown',
      hash: t.hash || '',
      size: t.size || 0,
      progress: t.progress || 0,
      state: t.state || 'unknown',
      eta: t.eta || 0,
    }));

    console.log(`[GetTorrentsTool] Returned ${simplifiedTorrents.length} torrent(s)`);
    return simplifiedTorrents;
  }
}

module.exports = { GetTorrentsTool };