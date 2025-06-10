const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');
const AuthService = require('../services/auth.service');

dotenv.config();

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI, 
});

const authService = new AuthService();

async function validateGoogleToken(req, res) {
  const { code } = req.body;

  console.log('✅ Received request to validate Google token');
  console.log('📩 Authorization code:', code);

  if (!code) {
    console.error('❌ No authorization code provided');
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    const { access_token, id_token } = tokens;

    console.log('🔑 Tokens received from Google:', {
      access_token,
      id_token,
    });

    if (!id_token) {
      console.error('❌ No ID token received from Google');
      return res.status(400).json({ error: 'No ID token received' });
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log('👤 Payload from ID token:', payload);

    if (!payload) {
      console.error('❌ Invalid ID token - no payload found');
      return res.status(401).json({ error: 'Invalid ID token' });
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      role: 'USER',
      name: payload.name,
      picture: payload.picture,
    };

    console.log('🔐 Logging in user via AuthService:', user);

    const { access_token: jwtAccessToken, refresh_token: jwtRefreshToken } =
      await authService.loginWithGoogle(user);

    console.log('✅ JWT tokens generated:', {
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    });

    // Set cookies
    res.cookie('access_token', jwtAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh_token', jwtRefreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    });

    console.log('🍪 Cookies set, redirecting user');

    return res.status(200).json({
      success: true,
      redirect: `${process.env.CLIENT_URL}/home`,
    });
  } catch (error) {
    console.error('🔥 Google OAuth validation error:', error.message);
    console.error(error.stack);
    return res.status(500).json({ error: 'Failed to validate Google token' });
  }
}


module.exports = { validateGoogleToken };