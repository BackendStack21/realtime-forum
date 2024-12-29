const W3CWebSocket = require('websocket').w3cwebsocket
const { getAuthToken } = require('../utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('../config') // Import configuration

const ACCESS_TOKEN = getAuthToken(
  WEBSOCKET_CLIENTS_SIGNING_KEY,
  5,
  {},
  ALGORITHM
)

const ws = new W3CWebSocket(
  `wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`
)
ws.onmessage = (event) => {
  const { topic, messageType, data } = JSON.parse(event.data)
  if (topic === 'main' && messageType === 'welcome') {
    console.log('> Connected!')

    ws.send(
      JSON.stringify({
        type: 'subscribe',
        data: {
          topic: 'backend-clock'
        }
      })
    )
  } else if (topic === 'backend-clock' && messageType === 'broadcast') {
    console.log('> Server time: ' + data)
    console.log(
      '- Propagation delay (End to End): ' +
        (new Date().getTime() - new Date(data).getTime()) +
        'ms'
    )
  }
}
ws.onclose = ({ code, reason }) => {
  console.log('Connection closed: ', {
    code,
    reason
  })
}
