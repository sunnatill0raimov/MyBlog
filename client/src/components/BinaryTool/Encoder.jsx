import React, { useState } from 'react';
import { useBinaryContext } from './BinaryContext';

const Encoder = () => {
    const { setLivePreview } = useBinaryContext();
    const [text, setText] = useState('');
    const [binary, setBinary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEncode = async () => {
        if (!text.trim()) {
            setError('Please enter text to encode');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/binary/encode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.success) {
                setBinary(data.binary);
                setLivePreview({
                    input: text,
                    binary: data.binary,
                    type: 'encode'
                });
            } else {
                setError(data.message || 'Encoding failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Encoding error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        setBinary('');

        // Update live preview in real-time
        if (newText.trim()) {
            // Simple client-side conversion for instant feedback
            const simpleBinary = newText.split('').map(char =>
                char.charCodeAt(0).toString(2).padStart(8, '0')
            ).join(' ');

            setLivePreview({
                input: newText,
                binary: simpleBinary,
                type: 'encode'
            });
        } else {
            setLivePreview(null);
        }
    };

    const copyToClipboard = () => {
        if (binary) {
            navigator.clipboard.writeText(binary)
                .then(() => alert('Binary copied to clipboard!'))
                .catch(() => alert('Failed to copy to clipboard'));
        }
    };

    return (
        <div className="binary-panel encoder-panel">
            <h3 className="panel-title">01 Text Encoder</h3>
            <div className="panel-content">
                <div className="input-group">
                    <label>Input Text:</label>
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Enter text to convert to binary..."
                        className="binary-input"
                        rows={3}
                    />
                </div>

                <button
                    onClick={handleEncode}
                    disabled={isLoading || !text.trim()}
                    className="encode-button"
                >
                    {isLoading ? 'Encoding...' : 'ENCODE TO BINARY'}
                </button>

                {error && <div className="error-message">{error}</div>}

                {binary && (
                    <div className="result-group">
                        <label>Binary Result:</label>
                        <div className="binary-result">
                            <div className="binary-text">{binary}</div>
                            <button onClick={copyToClipboard} className="copy-button">
                                COPY
                            </button>
                        </div>
                        <div className="result-info">
                            Characters: {text.length} | Binary length: {binary.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Encoder;
