// Import the required WebSocket library
// https://websockets.spec.whatwg.org
const W3CWebSocket = require('websocket').w3cwebsocket

const { getAuthToken } = require('./utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ADMIN_SIGNING_KEY, // For HS* signing algorithms, value should be "Admin Clients/Verification Key",
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('./config') // Import configuration constants

const SECURE_TOPIC = 'secure/inbound'

// Generate an access token with a 5 seconds expiration
// In production, JWT tokens should be obtained from an IDP (https://en.wikipedia.org/wiki/Identity_provider)
const ACCESS_TOKEN = getAuthToken(WEBSOCKET_CLIENTS_SIGNING_KEY, 5, {}, ALGORITHM, 'user-01')

// Generate an subscription auth token with a 5 seconds expiration
// In production, JWT tokens should be obtained from an IDP (https://en.wikipedia.org/wiki/Identity_provider)
const AUTH_TOKEN_FOR_SECURE_TOPIC = getAuthToken(ADMIN_SIGNING_KEY, 5, {
  roles: ['Subscriber'],
  allowedTopics: [SECURE_TOPIC]
}, ALGORITHM, 'user-01')

// Create a WebSocket connection
const ws = new W3CWebSocket(`wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`)
ws.onmessage = (event) => {
  // Parse incoming WebSocket messages
  const { topic, messageType, data } = event.data instanceof ArrayBuffer
    ? JSON.parse(new TextDecoder().decode(event.data)) // compression is enabled
    : JSON.parse(event.data)

  // Check if it's a welcome message from the 'main' topic
  if (topic === 'main' && messageType === 'welcome') {
    console.log('> Connected!')

    // Subscribe to a custom topic
    ws.send(JSON.stringify({
      type: 'subscribe',
      data: {
        topic: SECURE_TOPIC,
        auth: AUTH_TOKEN_FOR_SECURE_TOPIC
      }
    }))
  }

  // Log incoming WebSocket messages
  console.log('> Incoming message:', { topic, messageType, data, compression: event.data instanceof ArrayBuffer })
}
ws.onerror = (err) => {
  // Handle and log WebSocket connection errors
  console.log('Connection error: ', err)
}
ws.onclose = ({ code, reason }) => {
  // Handle and log WebSocket connection closure
  console.log('Connection closed: ', {
    code,
    reason
  })
}
