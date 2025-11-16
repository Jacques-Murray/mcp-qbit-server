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

The nginx example provides multiple configuration files to suit different deployment scenarios:

### Files Provided

**For integration with existing nginx:**

1. **`nginx-http.conf`** or **`nginx-http-context.conf`** - HTTP context directives (rate limiting zones)
   - Both files contain `limit_req_zone` directives that MUST be in the `http {}` block
   - `nginx-http-context.conf` has more detailed documentation and examples
   - `nginx-http.conf` is a simpler version
   - Add these directives to your main nginx.conf's `http {}` section

2. **`nginx-server.conf`** or **`nginx-server-blocks.conf`** - Server block configurations
   - Both files contain the actual server blocks for proxying to the MCP server
   - `nginx-server-blocks.conf` references `nginx-http-context.conf`
   - `nginx-server.conf` references `nginx-http.conf`
   - Can be included in nginx.conf or copied to sites-available/

**For standalone deployment:**

3. **`nginx-standalone.conf`** - Complete standalone configuration
   - Full nginx config with `http {}` block wrapper
   - Use for testing or as a template for new installations
   - **Do NOT include this in an existing nginx.conf** (nested `http {}` blocks are not allowed)

### Usage Scenarios

**Option 1: Integration with existing nginx installation** (Recommended)

1. Add the rate limiting zones from `nginx-http.conf` (or `nginx-http-context.conf`) to your main `/etc/nginx/nginx.conf`:
   ```nginx
   http {
       # Your existing configuration...
       
       # Add these lines from nginx-http.conf
       limit_req_zone $binary_remote_addr zone=mcp_limit:10m rate=10r/s;
       limit_req_zone $binary_remote_addr zone=mcp_secure_limit:10m rate=5r/s;
       
       # Rest of your configuration...
   }
   ```

2. Copy `nginx-server.conf` (or `nginx-server-blocks.conf`) to your sites configuration:
   ```bash
   sudo cp nginx-server.conf /etc/nginx/sites-available/mcp-qbit
   sudo ln -s /etc/nginx/sites-available/mcp-qbit /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

**Option 2: Standalone configuration**

Use `nginx-standalone.conf` as a complete configuration file:
```bash
nginx -c /path/to/nginx-standalone.conf -t
nginx -c /path/to/nginx-standalone.conf
```

### Important Notes

- Rate limiting zones (`limit_req_zone`) **must** be defined in the `http {}` context
- Rate limiting enforcement (`limit_req`) is applied within `server {}` or `location {}` blocks
- Never nest `http {}` blocks - this will cause nginx configuration errors

## Examples Included

1. **nginx** - Most popular, high-performance reverse proxy
2. **Caddy** - Modern, automatic HTTPS with Let's Encrypt
3. **Apache httpd** - Traditional, widely supported
4. **Traefik** - Container-native, automatic service discovery

Choose based on your infrastructure and requirements.
