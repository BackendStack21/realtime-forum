const { getAuthToken } = require('./utils')
const {
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM
} = require('./config')

const ACCESS_TOKEN = getAuthToken(WEBSOCKET_CLIENTS_SIGNING_KEY, 30, {}, ALGORITHM)
console.log({ ACCESS_TOKEN })
