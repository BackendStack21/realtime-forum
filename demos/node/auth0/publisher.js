const auth0 = require('./auth0-config')

auth0.getToken().then(accessToken => {
  const URL = `https://${auth0.REALTIME_CLUSTER_HOSTNAME}/api/topics/${auth0.REALTIME_APP_ID}/publish`
  const TOPIC = 'main'
  const MESSAGE = 'Hello on the other side ;)'

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      topic: TOPIC,
      message: MESSAGE,
      compress: true
    })
  }

  fetch(URL, options)
    .then(response => {
      console.log({
        statusText: response.statusText,
        status: response.status
      })
    })
})
