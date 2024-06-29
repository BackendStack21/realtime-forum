module.exports = {
  APP_ID: 'YOUR APPLICATION ID HERE...',
  CLUSTER_HOSTNAME: 'genesis.r7.21no.de',
  CLIENT_ID: 'YOUR AUTH0 CLIENT ID HERE...',
  CLIENT_SECRET: 'YOUR AUTH0 CLIENT SECRET HERE...',
  AUDIENCE: 'https://test.api.r7.21no.de',
  GRANT_TYPE: 'client_credentials',

  getToken () {
    return fetch('https://21node.eu.auth0.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        audience: this.AUDIENCE,
        grant_type: this.GRANT_TYPE
      })
    })
      .then(response => response.json())
      .then(data => data.access_token)
  }
}
