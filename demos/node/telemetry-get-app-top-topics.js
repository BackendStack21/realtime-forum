// Import "fetch" library
// NOTE: The 'fetch' library is natively available on Web browsers
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const {
  API_GATEWAY_HOSTNAME, // commonly api-gateway.r7.21no.de
  ADMIN_SIGNING_KEY,
  ALGORITHM,
  APP_ID
} = require('./config') // Import configuration constants

const { getAuthToken } = require('./utils')

const AUTH_TOKEN = getAuthToken(ADMIN_SIGNING_KEY, 5, {
  roles: ['ApplicationAdmin']
}, ALGORITHM, 'telemetry-operator')

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'X-App-Id': APP_ID
  }
}
fetch(`https://${API_GATEWAY_HOSTNAME}/telemetry/top-topics/${APP_ID}/1?limit=100`, options)
  .then(async response => {
    console.log({
      statusText: response.statusText,
      status: response.status
    })

    console.log(await response.json())
  })

