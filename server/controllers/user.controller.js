import User from '../models/user.model.js';

class UserController {
  // @desc    Search users for chat
  // @route   GET /api/users/search?q=keyword
  // @access  Private (any authenticated user)
  async searchUsers(req, res, next) {
    try {
      const keyword = req.query.search
        ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
        : {};

      // Exclude the current user from search results
      const users = await User.find(keyword)
        .find({ _id: { $ne: req.user._id } })
        .select('_id username email avatar')
        .limit(10);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all users
  // @route   GET /api/users
  // @access  Private/Admin
  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;

      const users = await User.find({})
        .select('-__v')
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({});
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single user
  // @route   GET /api/users/:id
  // @access  Private
  async getUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get user by username
  // @route   GET /api/users/profile/:username
  // @access  Public
  async getUserByUsername(req, res, next) {
    try {
      const user = await User.findOne({ username: req.params.username });

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user (admin only)
  // @route   PUT /api/users/:id
  // @access  Private/Admin
  async updateUser(req, res, next) {
    try {
      const { role, isActive } = req.body;

      const allowedUpdates = {};
      if (role !== undefined) allowedUpdates.role = role;
      if (isActive !== undefined) allowedUpdates.isActive = isActive;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        allowedUpdates,
        { new: true, runValidators: true }
      );

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete user
  // @route   DELETE /api/users/:id
  // @access  Private/Admin or Self
  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;

      // Check if user exists
      const user = await User.findById(userId);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      // Allow self-deletion or admin deletion
      if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
        const error = new Error('You can only delete your own account');
        error.statusCode = 403;
        return next(error);
      }

      await User.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
