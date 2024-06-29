const auth0 = require('./auth0-config')

auth0.getToken().then(accessToken => {
// Defining the arguments for the publishing operation
  const URL = `https://${auth0.CLUSTER_HOSTNAME}/api/topics/${auth0.APP_ID}/publish`
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

  // Execute the publish operation, which broadcasts the provided message into the specified target topic
  fetch(URL, options)
    .then(response => {
      console.log({
        statusText: response.statusText,
        status: response.status
      })
    })
})
