import logger from './logger.js';

const handleError = (res, error, customMessage = 'Internal Server Error') => {
    logger.error('Error:', {
        message: error.message,
        stack: error.stack,
        customMessage
    });

    res.status(500).json({
        success: false,
        message: customMessage
    });
};

export {
    handleError
};
