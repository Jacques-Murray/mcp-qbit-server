// Author: Jacques Murray

const axios = require('axios');
const { URLSearchParams } = require('url');

/**
 * A robust OOP client for the qBittorrent WebUI API (v4.1+).
 * Handles authentication, session cookie management, and
 * automatic re-login on session expiration (403 Forbidden).
 */
class QBitClient {
  /**
   * @param {string} baseUrl e.g., 'http://localhost:8080'
   * @param {string} username
   * @param {string} password
   */
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.cookie = null; // Stores the SID
    this.apiUrl = `${this.baseUrl}/api/v2`;
  }

  /**
   * Authenticates with teh qBittorrent API and stores the session cookie.
   * @returns {Promise<boolean>} True if login was successful.
   */
  async login() {
    const params = new URLSearchParams();
    params.append('username', this.username);
    params.append('password', this.password);

    try {
      const response = await axios.post(
        `${this.apiUrl}/auth/login`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.trim() === 'Ok.') {
        // Extract the session cookie (SID)
        const cookie = response.headers['set-cookie']?.[0];
        if (cookie) {
          this.cookie = cookie.split(';')[0]; // Get just the 'SID=...' part
          console.log('[QBitClient] Login successful.');
          return true;
        }
      }
      console.log('[QBitClient] Loging failed: "Ok." not received.');
      return false;
    } catch (error) {
      console.error('[QbitClient] Login request failed:', error.message);
      return false;
    }
  }

  /**
   * A private helper to make authenticated requests.
   * Handles session expiration and retries the request once.
   * @private
   * @param {Function} requestFn A function that returns an Axios promise.
   * @returns {Promise<any>} The data from the Axios response.
   */
  async #makeRequest(requestFn) {
    if (!this.cookie) {
      const loggedIn = await this.login();
      if (!loggedIn) {
        throw new Error('qBittorrent login failed');
      }
    }

    try {
      // Try the request with the current cookie
      const response = await requestFn(this.cookie);
      return response.data;
    } catch (error) {
      // If 403 Forbidden, session likely expired. Try re-logging in.
      if (error.response && error.response.status === 403) {
        console.warn('[QBitClient] Session expired (403). Re-authenticating...');
        const loggedIn = await this.login();
        if (!loggedIn) {
          throw new Error('qBittorrent re-login failed');
        }
        // Retry the request with the new cookie
        const retryResponse = await requestFn(this.cookie);
        return retryResponse.data;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Gets a list of torrents, with optional filters.
   * @param {string} [filter] 'all', 'downloading', 'seeding', etc.
   * @param {string} [status] 'paused', etc.
   * @returns {Promise<Array<object>>} List of torrent objects.
   */
  async getTorrents(filter, status) {
    return this.#makeRequest((cookie) => {
      return axios.get(`${this.apiUrl}/torrents/info`, {
        headers: { Cookie: cookie },
        params: { filter, status },
      });
    });
  }

  /**
   * Adds a new torrent via URL (magnet link or .torrent URL).
   * @param {string} url The URL of the torrent.
   * @returns {Promise<boolean>} True if the torrent was added.
   */
  async addTorrent(url) {
    const params = new URLSearchParams();
    params.append('urls', url);

    const data = await this.#makeRequest((cookie) => {
      return axios.post(`${this.apiUrl}/torrents/add`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookie
        },
      });
    });

    // API returns 'Ok.' on success
    return data.trim() === 'Ok.';
  }
}

module.exports = { QBitClient };