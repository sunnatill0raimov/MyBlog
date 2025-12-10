import React, { useState } from 'react';
import { useBinaryContext } from './BinaryContext';

const Decoder = () => {
    const { setLivePreview } = useBinaryContext();
    const [binary, setBinary] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDecode = async () => {
        if (!binary.trim()) {
            setError('Please enter binary to decode');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/binary/decode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ binary }),
            });

            const data = await response.json();

            if (data.success) {
                setText(data.text);
                setLivePreview({
                    input: binary,
                    binary: data.text,
                    type: 'decode'
                });
            } else {
                setError(data.message || 'Decoding failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Decoding error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBinaryChange = (e) => {
        const newBinary = e.target.value;
        setBinary(newBinary);
        setText('');

        // Update live preview in real-time
        if (newBinary.trim()) {
            setLivePreview({
                input: newBinary,
                binary: 'Decoding...',
                type: 'decode'
            });
        } else {
            setLivePreview(null);
        }
    };

    const copyToClipboard = () => {
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => alert('Text copied to clipboard!'))
                .catch(() => alert('Failed to copy to clipboard'));
        }
    };

    return (
        <div className="binary-panel decoder-panel">
            <h3 className="panel-title">Binary Decoder</h3>
            <div className="panel-content">
                <div className="input-group">
                    <label>Binary Input:</label>
                    <textarea
                        value={binary}
                        onChange={handleBinaryChange}
                        placeholder="Enter binary (space-separated 8-bit values)..."
                        className="binary-input"
                        rows={3}
                    />
                </div>

                <button
                    onClick={handleDecode}
                    disabled={isLoading || !binary.trim()}
                    className="decode-button"
                >
                    {isLoading ? 'Decoding...' : 'DECODE TO TEXT'}
                </button>

                {error && <div className="error-message">{error}</div>}

                {text && (
                    <div className="result-group">
                        <label>Decoded Text:</label>
                        <div className="text-result">
                            <div className="decoded-text">{text}</div>
                            <button onClick={copyToClipboard} className="copy-button">
                                COPY
                            </button>
                        </div>
                        <div className="result-info">
                            Binary length: {binary.replace(/\s+/g, '').length} | Characters: {text.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Decoder;
