// Import the required WebSocket library
// https://websockets.spec.whatwg.org
const W3CWebSocket = require('websocket').w3cwebsocket

const { getAuthToken, getRandomId } = require('./utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('./config') // Import configuration constants

let connections = 0
function connect () {
  // This is required to bypass the WebSocket connection limit for same subject
  // see: https://realtime.21no.de/documentation/#other-low-level-websocket-server-settings
  const SUBJECT = getRandomId()

  // Generate an access token with a 60 seconds expiration
  const ACCESS_TOKEN = getAuthToken(WEBSOCKET_CLIENTS_SIGNING_KEY, 60, {}, ALGORITHM, SUBJECT)

  // Create a WebSocket connection
  const ws = new W3CWebSocket(`wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`)
  ws.onmessage = (event) => {
    // Parse incoming WebSocket messages
    const { topic, messageType, data } = event.data instanceof ArrayBuffer
      ? JSON.parse(new TextDecoder().decode(event.data)) // compression is enabled
      : JSON.parse(event.data)

    // Check if it's a welcome message from the 'main' topic
    if (topic === 'main' && messageType === 'welcome') {
      console.log(`> Client ${++connections} connected!`)
    }

    // Log incoming WebSocket messages
    console.log('> Incoming message:', { topic, messageType, data, compression: event.data instanceof ArrayBuffer })
  }
  ws.onclose = ({ code, reason }) => {
    // Handle and log WebSocket connection closure
    console.log('Connection closed: ', {
      code,
      reason
    })
  }
}

for (let i = 0; i < 100; i++) {
  connect()
}
