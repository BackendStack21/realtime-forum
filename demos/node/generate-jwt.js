// Import required modules
const config = require('./config')
const utils = require('./utils')

// Default token configurations from environment variables or fallback values
const SUBJECT = process.env.SUBJECT || 'user0' // Default subject identifier
const EXPIRES_IN = process.env.EXPIRES_IN || '10m' // Default token expiration time
const TOKEN_TYPE = process.env.TOKEN_TYPE || 'client' // Default token type: 'client' or 'admin'
const DEFAULT_PAYLOAD = {
  admin: {
    roles: ['Publisher'],
    allowedTopics: ['*']
  }
}

/**
 * Generates an authentication token based on the specified type.
 * It selects the appropriate signing key from the configuration based on the token type.
 * Then, it calls the utility function to generate the token with the specified parameters.
 *
 * @returns {string} The generated authentication token.
 */
function generateAuthToken () {
  // Select the signing key based on the token type
  const signingKey = TOKEN_TYPE === 'client'
    ? config.WEBSOCKET_CLIENTS_SIGNING_KEY // Client token signing key
    : config.ADMIN_SIGNING_KEY // Admin token signing key

  // Generate the token using the utility function
  const token = utils.getAuthToken(
    signingKey,
    EXPIRES_IN,
    DEFAULT_PAYLOAD[TOKEN_TYPE] || {}, // Payload is empty, can be extended to include additional information
    config.ALGORITHM, // Algorithm from the configuration
    SUBJECT // Subject identifier
  )

  return token
}

// Generate and log the token
const token = generateAuthToken()
console.log({
  token,
  expiresIn: EXPIRES_IN,
  subject: SUBJECT,
  tokeType: TOKEN_TYPE
})
