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

The nginx example configuration (`nginx.conf`) demonstrates proper usage of rate limiting:

- **Rate limit zones** (`limit_req_zone`) are defined at the `http` level (lines 6-7)
- **Rate limit enforcement** (`limit_req`) is applied within individual `server` blocks

This structure follows nginx best practices:
- `limit_req_zone` creates shared memory zones and **must** be defined in the `http` context
- `limit_req` applies the rate limiting rules and is used within `server` or `location` blocks

### Usage Options

You can use this configuration in two ways:

1. **Standalone configuration**: Include the entire file with its `http` block wrapper
2. **Integration with existing nginx.conf**: Extract only the `limit_req_zone` directives and add them to your main `nginx.conf` file's `http` context, then add the `server` blocks to your sites configuration

## Examples Included

1. **nginx** - Most popular, high-performance reverse proxy
2. **Caddy** - Modern, automatic HTTPS with Let's Encrypt
3. **Apache httpd** - Traditional, widely supported
4. **Traefik** - Container-native, automatic service discovery

Choose based on your infrastructure and requirements.
