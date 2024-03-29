const APP_ID = 'YOUR_APP_ID'
const AUTH_TOKEN = 'Bearer AUTH_TOKEN_HERE'

const reqHeaders = new Headers()
reqHeaders.append('Accept', 'application/json')
reqHeaders.append('Content-Type', 'application/json')
reqHeaders.append('Authorization', AUTH_TOKEN)

fetch(`https://genesis.r7.21no.de/api/topics/${APP_ID}/publish`, {
  method: 'POST',
  headers: reqHeaders,
  body: JSON.stringify({
    topic: 'main',
    message: {
      msg: 'Hello Client!',
      time: Date.now()
    }
  })
})
  .then(() => console.log('Message published!'))
  .catch(console.error)

