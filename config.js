// Author: Jacques Murray

/**
 * Loads and exposes configuration from environment variables.
 */
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 8000,
  qbit: {
    baseUrl: process.env.QBIT_BASE_URL,
    username: process.env.QBIT_USERNAME,
    password: process.env.QBIT_PASSWORD
  }
}