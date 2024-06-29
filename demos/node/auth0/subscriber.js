// Import the required WebSocket library
// https://websockets.spec.whatwg.org
const W3CWebSocket = require('websocket').w3cwebsocket

const auth0 = require('./auth0-config')

auth0.getToken().then(accessToken => {
  // Create a WebSocket connection
  const ws = new W3CWebSocket(`wss://${auth0.REALTIME_CLUSTER_HOSTNAME}/apps/${auth0.REALTIME_APP_ID}?access_token=${accessToken}`)
  ws.onmessage = (event) => {
    // Parse incoming WebSocket messages
    const { topic, messageType, data } = event.data instanceof ArrayBuffer
      ? JSON.parse(new TextDecoder().decode(event.data)) // compression is enabled
      : JSON.parse(event.data)

    // Check if it's a welcome message from the 'main' topic
    if (topic === 'main' && messageType === 'welcome') {
      console.log('> Connected!')
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
})
