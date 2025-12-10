/**
 * Binary Conversion Utilities
 * Provides functions for text-to-binary and binary-to-text conversion
 */

// Text to Binary conversion
const textToBinary = (text) => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text.split('').map(char => {
        // Get binary representation of each character
        const binary = char.charCodeAt(0).toString(2);
        // Pad with leading zeros to make it 8 bits
        return binary.padStart(8, '0');
    }).join(' ');
};

// Binary to Text conversion
const binaryToText = (binary) => {
    if (!binary || typeof binary !== 'string') {
        return '';
    }

    // Remove any extra whitespace and split by spaces
    const binaryArray = binary.trim().split(/\s+/);

    return binaryArray.map(binaryChar => {
        // Convert each 8-bit binary to character
        const charCode = parseInt(binaryChar, 2);
        return String.fromCharCode(charCode);
    }).join('');
};

// Validate binary string
const isValidBinary = (binary) => {
    if (!binary || typeof binary !== 'string') {
        return false;
    }

    // Remove whitespace and check if only 0s and 1s remain
    const cleaned = binary.replace(/\s+/g, '');
    return /^[01]+$/.test(cleaned);
};

export {
    textToBinary,
    binaryToText,
    isValidBinary
};
