# Reverse Proxy Configuration Examples

This directory contains example configurations for running the MCP qBittorrent Server behind various reverse proxies.

## Why Use a Reverse Proxy?

Running behind a reverse proxy provides:
- **TLS/SSL termination** for encrypted HTTPS connections
- **Rate limiting** to prevent abuse
- **Authentication** to protect the API endpoint
- **Load balancing** for horizontal scaling
- **Static file serving** if needed
- **Request logging** and monitoring

## Important Security Note

⚠️ **The MCP server has no built-in authentication.** Always deploy it behind:
- A reverse proxy with authentication, OR
- A firewall that restricts access to trusted networks only

## nginx Configuration

Three nginx configuration files are provided to support different deployment scenarios:

### Configuration Files

1. **`nginx.conf`** - Complete standalone example
   - Includes full `http {}` block wrapper
   - Use this as a reference or as a standalone nginx configuration
   - ⚠️ **DO NOT** include this file in an existing nginx.conf that already has an `http {}` block

2. **`nginx-http.conf`** - HTTP-level directives snippet
   - Contains `limit_req_zone` directives that must be in the `http {}` context
   - Add these lines to your existing nginx.conf's `http {}` block
   - Must be included before the server blocks that use these zones

3. **`nginx-servers.conf`** - Server blocks snippet
   - Contains the actual server configurations for proxying to MCP
   - Can be included in your nginx configuration after the http-level directives are in place
   - Includes both basic and authenticated server examples

### Usage Scenarios

**Scenario 1: Standalone nginx for MCP only**
- Use `nginx.conf` directly as your nginx configuration
- This file contains everything needed in a single file

**Scenario 2: Adding MCP to existing nginx setup**
1. Add the contents of `nginx-http.conf` to your existing `nginx.conf` inside the `http {}` block
2. Add the contents of `nginx-servers.conf` to your sites configuration (e.g., `/etc/nginx/sites-available/mcp-qbit`)
3. Enable the site and reload nginx

### Rate Limiting Architecture

This configuration demonstrates proper usage of nginx rate limiting:
- **Rate limit zones** (`limit_req_zone`) are defined at the `http` level
- **Rate limit enforcement** (`limit_req`) is applied within individual `server` blocks

This follows nginx best practices:
- `limit_req_zone` creates shared memory zones and **must** be defined in the `http` context
- `limit_req` applies the rate limiting rules and is used within `server` or `location` blocks

## Examples Included

1. **nginx** - Most popular, high-performance reverse proxy
2. **Caddy** - Modern, automatic HTTPS with Let's Encrypt
3. **Apache httpd** - Traditional, widely supported
4. **Traefik** - Container-native, automatic service discovery

Choose based on your infrastructure and requirements.
