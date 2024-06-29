const config = require('./auth0-config')

config.getToken().then(accessToken => {
  const URL = `https://${config.REALTIME_CLUSTER_HOSTNAME}/api/topics/${config.REALTIME_APP_ID}/publish`
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
