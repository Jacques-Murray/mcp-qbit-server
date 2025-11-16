# Contributing to MCP qBittorrent Server

Thanks for helping improve this project! This guide explains how to report issues, suggest ideas, and submit code changes.

## Code of Conduct
Participation in this project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By contributing you agree to uphold its standards.

## Ways to Contribute
- **Bug reports** – describe reproduction steps, expected vs. actual behavior, and environment details.
- **Feature requests** – explain the use case and how it benefits MCP users.
- **Documentation** – clarify README sections, add diagrams, or improve examples.
- **Code** – fix bugs, add tests, or implement additional qBittorrent tools.

## Development Setup
1. Fork and clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `README.md`) if you want to hit a live qBittorrent instance.
4. Run the service locally for manual testing:
   ```bash
   npm run dev
   ```

## Branching & Workflow
1. Create an issue (or comment on an existing one) before starting substantial work.
2. Branch from `development` using a descriptive name, e.g. `feature/list-categories`.
3. Keep commits focused and reference issues in commit messages when possible.
4. Open a pull request against `development` once work is ready for review.

## Testing Checklist
Before opening a PR, ensure:
- `npm test` passes.
- New functionality includes Jest coverage and, when applicable, integration samples.
- Linting/formatting matches existing style (standard Node.js/Express conventions).

## Adding a New Tool
1. Create a class in `lib/mcp/tools` that extends `McpTool`.
2. Define a Zod `inputSchema` and document allowable arguments.
3. Inject dependencies through the constructor (prefer `QBitClient`).
4. Register the tool inside `createApp`.
5. Add Jest tests covering success paths and validation failures.
6. Update `README.md` with usage details.

## Pull Request Expectations
- Include a short summary of the change and testing evidence.
- Note any breaking changes or migrations.
- Keep PRs small and cohesive; large changes are harder to review.

## Getting Help
If you get stuck, open a draft PR or discussion and tag **Jacques Murray** (<jacquesmmurray@gmail.com>).
