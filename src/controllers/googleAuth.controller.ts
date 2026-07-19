import { Request, Response } from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, 'Firebase ID token is required');
  }

  // Verify the Firebase ID token
  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired Firebase ID token');
  }

  const { email, name, picture } = decodedToken;

  if (!email) {
    throw new ApiError(400, 'Email not found in Firebase token');
  }

  // Find existing user or create new one
  let user = await User.findOne({ email });

  if (user) {
    // If user exists but registered locally, link Google account
    if (user.authProvider === 'local' && !user.avatar && picture) {
      user.avatar = picture;
      user.authProvider = 'google';
      await user.save();
    }
  } else {
    // Create new user from Google data
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      avatar: picture || '',
      authProvider: 'google',
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id.toString()),
  });
});
