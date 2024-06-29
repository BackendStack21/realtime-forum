module.exports = {
  REALTIME_APP_ID: 'YOUR APPLICATION ID HERE...',
  REALTIME_CLUSTER_HOSTNAME: 'genesis.r7.21no.de',

  AUTH0_CLIENT_ID: 'YOUR AUTH0 CLIENT ID HERE...',
  AUTH0_CLIENT_SECRET: 'YOUR AUTH0 CLIENT SECRET HERE...',
  AUTH0_DOMAIN: 'YOUR AUTH0 DOMAIN HERE...',
  AUTH0_AUDIENCE: 'YOUR API AUDIENCE HERE...',
  AUTH0_GRANT_TYPE: 'client_credentials',
  
  getToken () {
    return fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.AUTH0_CLIENT_ID,
        client_secret: this.AUTH0_CLIENT_SECRET,
        audience: this.AUTH0_AUDIENCE,
        grant_type: this.AUTH0_GRANT_TYPE
      })
    })
      .then(response => response.json())
      .then(data => data.access_token)
  }
}
