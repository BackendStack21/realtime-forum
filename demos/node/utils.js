// Import the JSON Web Token library
const jwt = require('jsonwebtoken')

module.exports = {
  getAuthToken (secretOrPrivateKey, expiresIn, payload = {}, algorithm = 'HS256', subject = 'user-id-goes-here') {
    // Generate and return a JSON Web Token for authentication
    return jwt.sign(payload, secretOrPrivateKey, {
      algorithm,
      expiresIn,
      issuer: 'https://idp.example.com',
      subject
    })
  }
}
