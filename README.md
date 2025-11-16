# MCP qBittorrent Server

A lightweight Model Context Protocol (MCP) server that exposes curated qBittorrent automation primitives over JSON-RPC. The service wraps qBittorrent's WebUI API with strict validation, dependency-injected tooling, and Jest-backed regression tests so agents can safely query torrent status or add new torrents.

## Highlights
- **JSON-RPC 2.0 transport** with a single `/rpc` endpoint and health probe at `/health`.
- **Tool registry + DI container** (`lib/mcp`) that wires qBittorrent-aware tools at startup.
- **Strict argument validation** via Zod schemas to prevent malformed torrent operations.
- **Testable composition root** (`createApp`) that enables mocking `QBitClient` inside Jest tests.
- **Ready-to-ship Node.js service** with dotenv-based configuration and nodemon-powered dev loop.

## Architecture
```
client ──JSON-RPC──> Express (/rpc)
                    │
                    ▼
              JsonRpcHandler
                    │
              ToolService (tools/call)
                    │
              ToolRegistry (DI container)
             ┌──────────────┴──────────────┐
     GetTorrentsTool               AddTorrentTool
             │                             │
             └──────────────QBitClient─────┘
```
- `lib/qbit/QBitClient` encapsulates authentication, cookie reuse, and retries for qBittorrent WebUI.
- Tools inherit from `McpTool` and declare their own Zod `inputSchema` plus `execute` logic.
- `ToolService` validates `tools/call` payloads, resolves the tool from `ToolRegistry`, runs it, and normalizes success/error results.

## Requirements
- Node.js 18+ (LTS recommended)
- npm 10+
- Running qBittorrent instance with WebUI enabled

## Configuration
Create a `.env` file (or export environment variables) before starting the server:

```
PORT=8000
QBIT_BASE_URL=http://localhost:8080
QBIT_USERNAME=admin
QBIT_PASSWORD=secret
```

The qBittorrent credentials and `QBIT_BASE_URL` are required. `PORT` is optional and defaults to `8000`.

## Installation & Local Run
```bash
npm install
npm run dev
```
- `npm run dev` launches the service with nodemon so code edits trigger reloads.
- Use `npm start` in production environments to run `server.js` directly.

## Health & RPC Endpoints
| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Returns `{ status: "ok" }` for readiness probes. |
| POST | `/rpc` | Accepts JSON-RPC 2.0 payloads for MCP tooling. |

### Sample Request
```bash
curl -X POST http://localhost:8000/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "qbit/getTorrents",
      "arguments": { "filter": "all" }
    }
  }'
```

### Sample Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "isError": false,
    "content": [
      { "name": "ubuntu.iso", "state": "seeding", "progress": 1 },
      { "name": "movie.mkv", "state": "downloading", "progress": 0.42 }
    ]
  }
}
```

## Available Tools
| Tool Name | Description | Arguments |
| --- | --- | --- |
| `qbit/getTorrents` | Lists torrents and returns a simplified view (`name`, `hash`, `size`, `progress`, `state`, `eta`). Filter status values (e.g., `all`, `downloading`, `seeding`) via the `filter` argument. | `filter?: string` |
| `qbit/addTorrent` | Adds a new torrent using a magnet or `.torrent` URL, returning a success flag. | `url: string (valid URL)` |

Each tool enforces its own Zod schema before touching qBittorrent, so malformed payloads never reach the client.

## Testing
Run the Jest suite (mocks qBittorrent so no external dependency is needed):
```bash
npm test
```
Tests live in `tests/mcp.test.js` and cover health checks, transport errors, and both tool paths.

## Deployment Notes
- The service is stateless; run behind any reverse proxy and scale horizontally.
- Ensure qBittorrent WebUI API is reachable from this server and that credentials are scoped appropriately.
- Consider setting `NODE_ENV=production` so Express omits stack traces.

## Contributing
Guidelines live in `CONTRIBUTING.md`. In short: open an issue, run `npm test` before submitting, and document new tools.

## Code of Conduct
Participation is governed by `CODE_OF_CONDUCT.md`, which adapts the Contributor Covenant to keep the community welcoming.

## License
Distributed under the MIT License. See `LICENSE` for details.

## Maintainer
Created and maintained by **Jacques Murray** (<jacquesmmurray@gmail.com>).
