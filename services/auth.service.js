const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  async loginWithGoogle(userData) {
    const { id: googleId, email, name, picture } = userData;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        isEmailVerified: true,
        lastLoginDate: new Date(),
      });
    } else {
      await User.updateOne(
        { _id: user._id },
        { lastLoginDate: new Date(), isEmailVerified: true }
      );
    }

    const tokens = await this.getTokens(user._id.toString(), email, 'USER');

    console.log(`Redis set: access-token:${tokens.access_token}, TTL: 10800`);

    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async getTokens(userId, email, role, rememberMe = false) {
    const accessToken = jwt.sign(
      { sub: userId, email, role },
      this.jwtSecret,
      { expiresIn: rememberMe ? '30d' : '3h' }
    );
    const refreshToken = jwt.sign(
      { sub: userId, email, role },
      this.jwtRefreshSecret,
      { expiresIn: rememberMe ? '60d' : '7d' }
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async updateRefreshToken(userId, refreshToken) {
    console.log(`Refresh token updated for user ${userId}: ${refreshToken}`);
    await User.updateOne({ _id: userId }, { refreshToken });
  }
}

module.exports = AuthService;