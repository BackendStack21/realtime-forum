const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { getAuthToken } = require('../utils')

const {
  APP_ID,
  ADMIN_SIGNING_KEY, // For HS* signing algorithms, value should be "Admin Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('../config') // Import configuration

const URL = `https://${CLUSTER_HOSTNAME}/api/topics/${APP_ID}/publish`
const TOPIC = 'backend-clock'

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

setInterval(() => {
  const AUTH_TOKEN = getAuthToken(ADMIN_SIGNING_KEY, 5, {
    permissions: ['realtime:publisher:write:topic:' + TOPIC]
  }, ALGORITHM, 'app-publisher')

  options.headers.Authorization = `Bearer ${AUTH_TOKEN}`
  options.body = JSON.stringify({
    topic: TOPIC,
    message: new Date().toISOString(),
    compress: false
  })

  const startTime = new Date().getTime()
  fetch(URL, options).then(async response => {
    console.log({
      statusText: response.statusText,
      status: response.status
    })

    console.log('Publishing latency (HTTP endpoint): ' + (new Date().getTime() - startTime) + 'ms')
  })
}, 1000)
