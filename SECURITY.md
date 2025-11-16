# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

### Authentication & Authorization
- **Session Management**: The server maintains secure session cookies for qBittorrent authentication
- **Credential Protection**: All qBittorrent credentials are stored in environment variables, never in code
- **Automatic Re-authentication**: Expired sessions are automatically renewed without exposing credentials

### Input Validation
- **Strict Schema Validation**: All tool inputs are validated using Zod schemas before processing
- **URL Validation**: Torrent URLs are validated to ensure they are well-formed and use allowed protocols (magnet:, http:, https:)
- **Type Safety**: TypeScript-style JSDoc annotations ensure type correctness throughout the codebase

### Network Security
- **Request Timeouts**: All HTTP requests include configurable timeouts to prevent hanging connections
- **Connection Error Handling**: Detailed error messages for connection issues without exposing sensitive system information
- **Limited Payload Size**: JSON payloads are limited to 1MB to prevent memory exhaustion attacks

### HTTP Security Headers
The server implements the following security headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME-type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `Content-Security-Policy: default-src 'none'` - Restricts resource loading
- `X-Powered-By` header is disabled to reduce information disclosure

### Error Handling
- **Sanitized Error Messages**: Production mode hides detailed error information from API responses
- **Secure Logging**: Sensitive information (passwords, full URLs) is never logged
- **Graceful Degradation**: The server handles errors without crashing or exposing stack traces

## Best Practices for Deployment

### Environment Variables
1. **Never commit** `.env` files to version control
2. Use strong, unique passwords for qBittorrent credentials
3. Limit the qBittorrent user to minimum necessary permissions
4. Consider using a secrets management system (e.g., HashiCorp Vault, AWS Secrets Manager) for production

### Network Configuration
1. **Reverse Proxy**: Always run behind a reverse proxy (nginx, Caddy, etc.) with:
   - Rate limiting to prevent abuse
   - TLS/SSL termination for encrypted connections
   - Request size limits
   - IP whitelisting if possible

2. **Firewall Rules**: Restrict access to:
   - Only allow RPC endpoint access from trusted networks
   - Ensure qBittorrent WebUI is not publicly accessible
   - Use VPN or private network for qBittorrent communication

### Application Security
1. **NODE_ENV**: Always set `NODE_ENV=production` in production to:
   - Hide detailed error messages
   - Optimize performance
   - Disable development-only features

2. **Regular Updates**: 
   - Keep Node.js updated to the latest LTS version
   - Run `npm audit` regularly and address vulnerabilities
   - Update dependencies periodically

3. **Monitoring**:
   - Monitor `/health` endpoint for availability
   - Log and alert on authentication failures
   - Track unusual API usage patterns

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer directly at: jacquesmmurray@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### Response Timeline
- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next scheduled release

### Disclosure Policy
We follow coordinated disclosure:
1. We will work with you to understand and validate the issue
2. We will develop and test a fix
3. We will release the fix and credit you (unless you prefer anonymity)
4. After the fix is released, we will publish a security advisory

## Security Checklist for Contributors

Before submitting code:
- [ ] No hardcoded credentials or secrets
- [ ] Input validation for all user-supplied data
- [ ] Error messages don't leak sensitive information
- [ ] No SQL injection, command injection, or path traversal vulnerabilities
- [ ] Dependencies are up-to-date and have no known vulnerabilities
- [ ] Tests cover security-critical code paths
- [ ] Documentation updated for any security-relevant changes

## Known Limitations

1. **No Rate Limiting**: The application does not implement rate limiting at the application level. This should be handled by a reverse proxy.
2. **No Authentication**: The JSON-RPC endpoint has no built-in authentication. It should only be exposed to trusted networks or behind an authenticating reverse proxy.
3. **Session Storage**: Sessions are stored in memory and will be lost on restart. This is intentional for simplicity but means credential re-authentication after restarts.

## Security Advisories

No security advisories have been published for this project yet.
