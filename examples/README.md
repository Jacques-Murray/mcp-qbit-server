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

We provide **three nginx configuration files** to support different deployment scenarios:

### 1. `nginx-standalone.conf` - Complete Standalone Configuration

**Use when:** You want a complete, ready-to-use nginx configuration.

- Contains a full `http` block with all necessary directives
- ⚠️ **WARNING:** Do NOT include this in an existing nginx.conf that already has an `http` block (nested `http` blocks are not allowed)
- **Usage:** `sudo nginx -c /path/to/nginx-standalone.conf` or replace your main nginx.conf

### 2. `nginx-http-context.conf` + `nginx-server-blocks.conf` - Integration Snippets

**Use when:** You have an existing nginx setup and want to integrate the MCP qBittorrent Server.

#### Step 1: Add HTTP-level directives
File: `nginx-http-context.conf`
- Contains `limit_req_zone` directives that **must** be in the `http` context
- Add these lines to your main `nginx.conf` inside the existing `http {` block:

```nginx
http {
    # ... your existing configuration ...
    
    # Add rate limiting zones for MCP qBittorrent Server:
    limit_req_zone $binary_remote_addr zone=mcp_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=mcp_secure_limit:10m rate=5r/s;
    
    # ... rest of your configuration ...
}
```

#### Step 2: Add server blocks
File: `nginx-server-blocks.conf`
- Contains the `server` blocks for the MCP qBittorrent Server
- **Option A:** Include directly in nginx.conf's `http` block:
  ```nginx
  http {
      # ... (including the rate limit zones from step 1) ...
      include /path/to/nginx-server-blocks.conf;
  }
  ```
- **Option B:** Copy to sites-available (Debian/Ubuntu style):
  ```bash
  sudo cp nginx-server-blocks.conf /etc/nginx/sites-available/mcp-qbit
  sudo ln -s /etc/nginx/sites-available/mcp-qbit /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  ```

### nginx Rate Limiting Best Practices

nginx requires a specific structure for rate limiting:
- `limit_req_zone` creates shared memory zones and **must** be defined in the `http` context
- `limit_req` applies the rate limiting rules and is used within `server` or `location` blocks

Our separate configuration files ensure you can properly integrate rate limiting regardless of your existing nginx setup.

## Examples Included

1. **nginx** - Most popular, high-performance reverse proxy
2. **Caddy** - Modern, automatic HTTPS with Let's Encrypt
3. **Apache httpd** - Traditional, widely supported
4. **Traefik** - Container-native, automatic service discovery

Choose based on your infrastructure and requirements.
