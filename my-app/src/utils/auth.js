const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId.toString() }, 
    process.env.JWT_SECRET || 'defaultsecret', 
    { expiresIn: '7d' }
  );
};

module.exports = {
  googleClient,
  generateToken
};