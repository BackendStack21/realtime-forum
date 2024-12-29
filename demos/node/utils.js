// Import the JSON Web Token library
const jwt = require('jsonwebtoken')

module.exports = {
  getRandomId() {
    return Math.random().toString(36).substring(2)
  },
  getAuthToken(
    secretOrPrivateKey,
    expiresIn,
    payload = {},
    algorithm = 'HS256',
    subject = 'user-or-device-id-goes-here',
  ) {
    // Generate and return a JSON Web Token for authentication
    return jwt.sign(payload, secretOrPrivateKey, {
      algorithm,
      expiresIn,
      issuer: 'https://idp.example.com',
      subject,
    })
  },
}
