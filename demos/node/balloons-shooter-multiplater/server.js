// Import the required WebSocket library
// https://websockets.spec.whatwg.org
const W3CWebSocket = require('websocket').w3cwebsocket

const { getAuthToken } = require('./../utils')

const {
  APP_ID,
  WEBSOCKET_CLIENTS_SIGNING_KEY, // For HS* signing algorithms, value should be "WebSocket Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('./../config') // Import configuration constants

const SECURE_TOPIC = 'secure/inbound'

// Generate an access token with a 5 seconds expiration
// In production, JWT tokens should be obtained from an IDP (https://en.wikipedia.org/wiki/Identity_provider)
const ACCESS_TOKEN = getAuthToken(
  WEBSOCKET_CLIENTS_SIGNING_KEY,
  5,
  {
    permissions: [
      'realtime:subscriber:read:topic:' + SECURE_TOPIC,
      'realtime:publisher:write:topic:main'
    ]
  },
  ALGORITHM,
  'server'
)

// Game state
const players = new Map()
let projectiles = []
let balloons = []
let shouldUpdateGame = false

// Create a WebSocket connection
const ws = new W3CWebSocket(
  `wss://${CLUSTER_HOSTNAME}/apps/${APP_ID}?access_token=${ACCESS_TOKEN}`
)
ws.onmessage = (event) => {
  shouldUpdateGame = true

  const { topic, messageType, data } =
    event.data instanceof ArrayBuffer
      ? JSON.parse(new TextDecoder().decode(event.data)) // compression is enabled
      : JSON.parse(event.data)

  // Check if it's a welcome message from the 'main' topic
  if (topic === 'main' && messageType === 'welcome') {
    console.log('> Connected!')

    // Subscribe to a custom secure topic
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        data: {
          topic: SECURE_TOPIC
        }
      })
    )

    setInterval(() => {
      if (!shouldUpdateGame) {
        return
      }
      shouldUpdateGame = false

      updateGame()

      const gameState = {
        players: Array.from(players.values()),
        projectiles,
        balloons
      }
      if (ws && ws.readyState === W3CWebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'publish',
            data: {
              topic: 'main',
              compress: true,
              payload: {
                gameState
              }
            }
          })
        )
      }
    }, 1000 / 60) // 60 FPS
  } else if (topic === SECURE_TOPIC && messageType === 'presence') {
    /*
    // Example of a presence message for player disconnection
    data: {
      client: {
        connectionId: '4389b2ed1a7e',
        subject: 'user0@example.com',
        permissions: [Array]
      },
      subProtocol: 1,
      payload: { code: -1, status: 'disconnected' }
    }
    */

    /*
    // Example of a presence message for player connection
    data: {
      client: {
        connectionId: '4389b2ed1a7e',
        subject: 'user0@example.com',
        permissions: [Array]
      },
      subProtocol: 1,
      payload: { code: 0, status: 'connected' }
    }
    */

    const { client, payload } = data
    const playerId = client.connectionId

    if (payload.status === 'connected') {
      console.log(`> Player connected: ${playerId}`)
      const playerp = { x: Math.random() * 800, y: Math.random() * 600 }
      players.set(playerId, { id: playerId, p: playerp, score: 0 })
    } else if (payload.status === 'disconnected') {
      console.log(`> Player disconnected: ${playerId}`)
      players.delete(playerId)
    }
  } else if (topic === SECURE_TOPIC && messageType === 'broadcast') {
    const { client, payload } = data
    const playerId = client.connectionId

    switch (payload.type) {
      case 'move': {
        const player = players.get(playerId)
        if (player) {
          player.p = payload.p
        }
        break
      }
      case 'shoot': {
        projectiles.push({
          id: Date.now(),
          playerId,
          p: payload.p,
          v: payload.v
        })
        break
      }
    }
  }
}

ws.onclose = (code, reason) => {
  console.log({ code, reason })
}

function createBalloon () {
  return {
    id: Date.now(),
    p: { x: Math.random() * 800, y: Math.random() * 600 },
    radius: 20,
    color: `rgb(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    })`
  }
}

function generateBalloons () {
  if (balloons.length < 5) {
    balloons.push(createBalloon())
  }
}

function updateGame () {
  generateBalloons()

  // Update projectile ps and check for collisions
  projectiles = projectiles.filter((projectile) => {
    projectile.p.x += projectile.v.x
    projectile.p.y += projectile.v.y

    // Check for balloon collisions
    balloons = balloons.filter((balloon) => {
      const dx = projectile.p.x - balloon.p.x
      const dy = projectile.p.y - balloon.p.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < balloon.radius) {
        // Balloon hit, increase player score
        const player = players.get(projectile.playerId)
        if (player) {
          player.score += 1
        }
        return false // Remove the balloon
      }
      return true // Keep the balloon
    })

    // Keep projectile if it's within bounds
    return (
      projectile.p.x >= 0 &&
      projectile.p.x <= 800 &&
      projectile.p.y >= 0 &&
      projectile.p.y <= 600
    )
  })

  // Keep only the last 3 projectiles
  projectiles = projectiles.slice(-3)
}
