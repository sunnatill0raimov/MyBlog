import { textToBinary, binaryToText, isValidBinary } from '../utils/binary.js';

/**
 * Encode text to binary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const encodeText = (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Text is required for encoding'
            });
        }

        const binary = textToBinary(text);

        res.json({
            success: true,
            binary,
            length: binary.length,
            bytes: text.length
        });
    } catch (error) {
        console.error('Encoding error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during encoding'
        });
    }
};

/**
 * Decode binary to text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const decodeBinary = (req, res) => {
    try {
        const { binary } = req.body;

        if (!binary || typeof binary !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Binary data is required for decoding'
            });
        }

        if (!isValidBinary(binary)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid binary format. Only 0s and 1s with optional spaces are allowed.'
            });
        }

        const text = binaryToText(binary);

        res.json({
            success: true,
            text,
            length: text.length,
            binaryLength: binary.replace(/\s+/g, '').length
        });
    } catch (error) {
        console.error('Decoding error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during decoding'
        });
    }
};

/**
 * AI Binary Chat - Simple echo response for demonstration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const aiBinaryChat = (req, res) => {
    try {
        const { binary, text } = req.body;

        if (!binary && !text) {
            return res.status(400).json({
                success: false,
                message: 'Either binary or text input is required'
            });
        }

        let processedText = text;
        if (binary) {
            if (!isValidBinary(binary)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid binary format'
                });
            }
            processedText = binaryToText(binary);
        }

        // Simple AI response - convert to binary and add AI prefix
        const responseText = `AI: ${processedText}`;
        const responseBinary = textToBinary(responseText);

        res.json({
            success: true,
            response: responseText,
            binary: responseBinary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during AI processing'
        });
    }
};

export {
    encodeText,
    decodeBinary,
    aiBinaryChat
};
