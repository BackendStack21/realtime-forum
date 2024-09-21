const {RealtimeClient} = require('realtime-pubsub-client')
const { getAuthToken } = require('./utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('./config') // Import configuration constants

const clientOptions = {
  websocketOptions: {
    // other WebSocket options: https://www.npmjs.com/package/reconnecting-websocket#available-options
    urlProvider: async () => {
      // Implement getAuthToken according to your auth mechanism
      const ACCESS_TOKEN = getAuthToken(WEBSOCKET_CLIENTS_SIGNING_KEY, 5, {}, ALGORITHM)

      return `wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`
    },
  },
  // Optional: Pass a custom logger implementing the Logger interface
  // logger: console,
}

const client = new RealtimeClient(clientOptions)

client.on('session.started', (info) => {
  console.log('> Connected: ', info)

  client
    .subscribeRemoteTopic('topic1')
    .subscribeRemoteTopic('topic2')
  // ...

  console.log('> Subscribed to topics!')
})

client.on('main.hello-echo', (message) => {
  console.log('> Received hello-echo message:', message)
})

client.on('close', ({ code, reason }) => {
  console.log('Connection closed: ', { code, reason })
})

client.connect()