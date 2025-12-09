import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

class AuthService {
  // Register a new user
  async register(userData) {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      const error = new Error('User with this email or username already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken({ id: user._id });

    logger.info(`New user registered: ${user.username} (${user.email})`);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // Login user
  async login(credentials) {
    const { identifier, password } = credentials; // identifier can be email or username

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier).select('+password');

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken({ id: user._id });

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    logger.info(`User logged in: ${user.username}`);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // Get current user
  async getCurrentUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check old password
    const isOldPasswordValid = await user.checkPassword(oldPassword);

    if (!isOldPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);

    return { message: 'Password changed successfully' };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const { username, email, bio, ...otherData } = updateData;

    // Check for duplicate username/email if updating these fields
    if (username || email) {
      const duplicateCheck = {};
      if (username) duplicateCheck.username = username.toLowerCase();
      if (email) duplicateCheck.email = email.toLowerCase();

      if (Object.keys(duplicateCheck).length > 0) {
        duplicateCheck._id = { $ne: userId }; // Exclude current user

        const existingUser = await User.findOne(duplicateCheck);
        if (existingUser) {
          const error = new Error('Username or email already taken');
          error.statusCode = 409;
          throw error;
        }
      }
    }

    const allowedUpdates = { username, email, bio, ...otherData };
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === null || allowedUpdates[key] === undefined || allowedUpdates[key] === '') {
        delete allowedUpdates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info(`Profile updated for user: ${user.username}`);

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new AuthService();
