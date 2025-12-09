import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user.model.js';
import { env } from '../config/env.js';

// Middleware to protect routes
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      const error = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      return next(error);
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error('The token belonging to this user no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      const error = new Error('User recently changed password. Please log in again.');
      error.statusCode = 401;
      return next(error);
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated.');
      error.statusCode = 401;
      return next(error);
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token.';
      error.statusCode = 401;
    } else if (error.name === 'TokenExpiredError') {
      error.message = 'Your token has expired.';
      error.statusCode = 401;
    }
    next(error);
  }
};

// Middleware to restrict access to certain roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action.');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = await promisify(jwt.verify)(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }

    next();
  } catch (error) {
    // Silently ignore auth errors for optional auth
    next();
  }
};

export default { authenticate, authorize, optionalAuth };
