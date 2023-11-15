// Import "fetch" library
// NOTE: The 'fetch' library is natively available on Web browsers
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

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
  roles: ['SubscribersAdmin']
}, ALGORITHM, 'app-subscribers-admin')

// Defining the arguments for the unsubscribe operation
const URL = `https://${CLUSTER_HOSTNAME}/api/topics/${APP_ID}/unsubscribe`

// In this example we unsubscribe clients with subject="user0@example.com" from all secure topics
// up to 50 `topicPatterns` are supported
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`
  },
  body: JSON.stringify({
    topicPatterns: ['secure/*'],
    subject: 'user0@example.com'
  })
}

fetch(URL, options)
  .then(response => {
    console.log({
      statusText: response.statusText,
      status: response.status
    })
  })
