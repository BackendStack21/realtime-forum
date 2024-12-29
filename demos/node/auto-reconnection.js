const WebSocket = require('ws')
// https://www.npmjs.com/package/reconnecting-websocket
const ReconnectingWebSocket = require('reconnecting-websocket')

const {getAuthToken} = require('./utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME,
} = require('./config') // Import configuration constants

// Create a WebSocket connection
const options = {
  WebSocket,
  connectionTimeout: 1000,
  maxRetries: 10,
}
const ws = new ReconnectingWebSocket(
  () => {
    // Generate an access token with a 5 seconds expiration
    // In production, JWT tokens should be obtained from an IDP (https://en.wikipedia.org/wiki/Identity_provider)
    const ACCESS_TOKEN = getAuthToken(
      WEBSOCKET_CLIENTS_SIGNING_KEY,
      5,
      {},
      ALGORITHM,
    )

    return `wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`
  },
  [],
  options,
)
ws.onmessage = (event) => {
  // Parse incoming WebSocket messages
  const {topic, messageType, data} = JSON.parse(event.data)

  // Check if it's a welcome message from the 'main' topic
  if (topic === 'main' && messageType === 'welcome') {
    console.log('> Connected!')
  }

  // Log incoming WebSocket messages
  console.log('> Incoming message:', {topic, messageType, data})
}
ws.onerror = (err) => {
  // Handle and log WebSocket connection errors
  console.log('Connection error: ', err)
}
ws.onclose = ({code, reason}) => {
  // Handle and log WebSocket connection closure
  console.log('Connection closed: ', {
    code,
    reason,
  })
}
