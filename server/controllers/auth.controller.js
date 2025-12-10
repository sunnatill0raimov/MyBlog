import authService from '../services/auth.service.js';

class AuthController {
  // @desc    Register a new user
  // @route   POST /api/auth/register
  // @access  Public
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        const error = new Error('Username, email and password are required');
        error.statusCode = 400;
        return next(error);
      }

      if (password.length < 6) {
        const error = new Error('Password must be at least 6 characters long');
        error.statusCode = 400;
        return next(error);
      }

      const result = await authService.register({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;

      // Validation
      if (!identifier || !password) {
        const error = new Error('Email/username and password are required');
        error.statusCode = 400;
        return next(error);
      }

      const result = await authService.login({
        identifier: identifier.toLowerCase().trim(),
        password,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get current user profile
  // @route   GET /api/auth/me
  // @access  Private
  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Change password
  // @route   POST /api/auth/change-password
  // @access  Private
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      // Validation
      if (!oldPassword || !newPassword) {
        const error = new Error('Old password and new password are required');
        error.statusCode = 400;
        return next(error);
      }

      if (newPassword.length < 6) {
        const error = new Error('New password must be at least 6 characters long');
        error.statusCode = 400;
        return next(error);
      }

      if (oldPassword === newPassword) {
        const error = new Error('New password must be different from old password');
        error.statusCode = 400;
        return next(error);
      }

      const result = await authService.changePassword(req.user._id, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user profile
  // @route   PUT /api/auth/profile
  // @access  Private
  async updateProfile(req, res, next) {
    try {
      const { username, email, bio, displayName, isAnonymous, avatar } = req.body;

      // Basic validation - more thorough validation happens in service
      const updateData = {};
      if (username !== undefined) updateData.username = username?.trim();
      if (email !== undefined) updateData.email = email?.toLowerCase().trim();
      if (bio !== undefined) updateData.bio = bio?.trim();
      if (displayName !== undefined) updateData.displayName = displayName?.trim();
      if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;
      if (avatar !== undefined) updateData.avatar = avatar?.trim();

      const user = await authService.updateProfile(req.user._id, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Logout (client-side token removal, optional server-side cleanup)
  // @route   POST /api/auth/logout
  // @access  Private
  async logout(req, res, next) {
    try {
      // In a more complex setup, you might want to maintain a blacklist of tokens
      // or remove refresh tokens, but for now we'll just return success

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
