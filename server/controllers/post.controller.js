import Post from '../models/post.model.js';

class PostController {
  // @desc    Create a new post
  // @route   POST /api/posts
  // @access  Private
  async createPost(req, res, next) {
    try {
      const { title, content, excerpt, slug, tags, category, status, featured } = req.body;

      const post = await Post.create({
        title,
        content,
        excerpt,
        slug,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category,
        status: status || 'draft',
        author: req.user._id,
        featured: featured || false,
      });

      await post.populate('author', 'username avatar');

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all posts (public - published only)
  // @route   GET /api/posts
  // @access  Public
  async getPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const startIndex = (page - 1) * limit;

      const { category, tag, search, featured } = req.query;

      let query = { status: 'published' };

      if (category) query.category = category;
      if (tag) query.tags = { $in: [tag] };
      if (featured === 'true') query.featured = true;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
        ];
      }

      const posts = await Post.find(query)
        .populate('author', 'username avatar')
        .select('title excerpt slug coverImage tags category publishedAt views likeCount commentCount')
        .skip(startIndex)
        .limit(limit)
        .sort({ publishedAt: -1 });

      const total = await Post.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          posts,
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

  // @desc    Get single post by slug
  // @route   GET /api/posts/:slug
  // @access  Public
  async getPost(req, res, next) {
    try {
      const post = await Post.findOne({
        slug: req.params.slug,
        status: 'published'
      }).populate('author', 'username avatar bio');

      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        return next(error);
      }

      // Increment view count
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

      res.status(200).json({
        success: true,
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update post
  // @route   PUT /api/posts/:id
  // @access  Private (Author only)
  async updatePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        return next(error);
      }

      // Check if user is the author
      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You can only update your own posts');
        error.statusCode = 403;
        return next(error);
      }

      const { title, content, excerpt, tags, category, status, featured } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
      if (category) updateData.category = category;
      if (status) updateData.status = status;
      if (featured !== undefined) updateData.featured = featured;

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'username avatar');

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete post
  // @route   DELETE /api/posts/:id
  // @access  Private (Author only)
  async deletePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        return next(error);
      }

      // Check if user is the author
      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You can only delete your own posts');
        error.statusCode = 403;
        return next(error);
      }

      await Post.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get posts by author
  // @route   GET /api/posts/author/:userId
  // @access  Public
  async getPostsByAuthor(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;

      const posts = await Post.find({
        author: req.params.userId,
        status: 'published',
      })
        .populate('author', 'username avatar')
        .select('title excerpt slug coverImage tags category publishedAt views likeCount commentCount')
        .skip(startIndex)
        .limit(limit)
        .sort({ publishedAt: -1 });

      const total = await Post.countDocuments({
        author: req.params.userId,
        status: 'published',
      });
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          posts,
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

  // @desc    Get user's drafts
  // @route   GET /api/posts/drafts
  // @access  Private (Own drafts only)
  async getDrafts(req, res, next) {
    try {
      const posts = await Post.find({
        author: req.user._id,
        status: 'draft',
      })
        .select('title excerpt slug createdAt updatedAt')
        .sort({ updatedAt: -1 });

      res.status(200).json({
        success: true,
        data: { posts },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostController();
