const { getAuthToken } = require('./utils')

const {
  APP_ID,
  ADMIN_SIGNING_KEY, // For HS* signing algorithms, value should be "Admin Clients/Verification Key"
  ALGORITHM,
  CLUSTER_HOSTNAME
} = require('./config') // Import configuration constants

// Generate an access token with a 5 seconds expiration
// In production, JWT tokens should be obtained from an IDP (https://en.wikipedia.org/wiki/Identity_provider)
const AUTH_TOKEN = getAuthToken(ADMIN_SIGNING_KEY, 5, {
  permissions: ['realtime:publisher:write:topic:*']
  // or 
  // scope: 'realtime:publisher:write:topic:*'
}, ALGORITHM, 'app-publisher')

// Defining the arguments for the publishing operation
const URL = `https://${CLUSTER_HOSTNAME}/api/topics/${APP_ID}/publish`
const TOPIC = 'main'
const MESSAGE = 'Hello on the other side ;)'

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`
  },
  body: JSON.stringify({
    topic: TOPIC,
    message: MESSAGE,
    compress: true
  })
}

// Execute the publish operation, which broadcasts the provided message into the specified target topic
fetch(URL, options)
  .then(response => {
    console.log({
      statusText: response.statusText,
      status: response.status
    })
  })
