import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { refreshAccessToken  } from './user.controller.js';

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  // Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};
// ✅ @desc Google OAuth Signup/Login
// ✅ @route POST /api/v1/auth/google
// ✅ @access Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    const err = new Error('Google ID token is required');
    err.statusCode = 400;
    throw err;
  }

  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub } = payload;

  if (!email) {
    const err = new Error('Invalid Google token');
    err.statusCode = 401;
    throw err;
  }

  // Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    user = await User.create({
      username: name.replace(/\s+/g, '').toLowerCase(),
      email,
      passwordHash: '', // no password for Google users
      avatarUrl: picture,
      roles: ['user'],
      settings: { provider: 'google', googleId: sub },
      isVerified: true,
    });
  }
// 4. Create JWT token **after** user exists
  const jwtToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Generate JWT token
  const accessToken = generateToken(user);

  /*.status(200).json({
    success: true,
    message: 'Google authentication successful',
    token: accessToken,
    user: user.safeUser(),*/
    // Return safe user info
res.status(200).json({
  success: true,
  message: 'Logged in successfully',
  user: user.safeUser ? user.safeUser() : {
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
  },
  token: jwtToken,
  });
});
