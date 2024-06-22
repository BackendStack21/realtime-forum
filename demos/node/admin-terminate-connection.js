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
  permissions: ['realtime:admin:manage:connections']
}, ALGORITHM, 'app-connections-admin')

// Defining the arguments for the "terminate connection" operation
const CONNECTION_ID = 'client-connection-id-here'
const URL = `https://${CLUSTER_HOSTNAME}/api/connections/${APP_ID}/${CONNECTION_ID}`

// In this example, we close the WebSocket connection using its ID.
// Supports up to 50 topic patterns.
const options = {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`
  }
}

fetch(URL, options)
  .then(response => {
    console.log({
      statusText: response.statusText,
      status: response.status
    })
  })
