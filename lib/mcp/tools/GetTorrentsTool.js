// Author: Jacques Murray

const { McpTool } = require('../McpTool');
const { z } = require('zod');

// Zod schema for input validation
const GetTorrentsInputSchema = z.object({
  filter: z.string().optional(),
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
   * @param {z.infer<GetTorrentsInputSchema>} args
   */
  async execute(args) {
    const { filter } = args;
    console.log(`[GetTorrentsTool] Executing with filter=${filter}`);

    // The client handles the actual API call
    const torrents = await this.qbitClient.getTorrents(filter);

    // For brevity, we can return a subset of information
    const simplifiedTorrents = torrents.map(t => ({
      name: t.name,
      hash: t.hash,
      size: t.size,
      progress: t.progress,
      state: t.state,
      eta: t.eta,
    }));

    return simplifiedTorrents;
  }
}

module.exports = { GetTorrentsTool };