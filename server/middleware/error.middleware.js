import logger from '../utils/logger.js';
import { env } from '../config/env.js';

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Log the error
  logger.error('Error occurred:', {
    message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't leak error details in production
  const isProduction = env.NODE_ENV === 'production';
  const errorResponse = {
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal Server Error' : message,
    ...(isProduction ? {} : { stack: error.stack }),
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    res.status(400).json({
      ...errorResponse,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message),
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      ...errorResponse,
      message: 'Invalid ID format',
    });
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({
      ...errorResponse,
      message: 'Duplicate field value entered',
    });
    return;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorMiddleware;
