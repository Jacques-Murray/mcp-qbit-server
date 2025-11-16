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

## Examples Included

1. **nginx** - Most popular, high-performance reverse proxy
2. **Caddy** - Modern, automatic HTTPS with Let's Encrypt
3. **Apache httpd** - Traditional, widely supported
4. **Traefik** - Container-native, automatic service discovery

Choose based on your infrastructure and requirements.
