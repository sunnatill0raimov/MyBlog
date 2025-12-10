import React, { useState, useRef, useEffect } from 'react';
import { useBinaryContext } from './BinaryContext';

const AITerminal = () => {
    const { aiMessages, addAiMessage, clearAiMessages } = useBinaryContext();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [aiMessages]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) {
            setError('Please enter a message');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Add user message
            addAiMessage({
                type: 'user',
                content: input,
                timestamp: new Date().toISOString()
            });

            // Send to AI
            const response = await fetch('/api/binary/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: input }),
            });

            const data = await response.json();

            if (data.success) {
                // Add AI response
                addAiMessage({
                    type: 'ai',
                    content: data.response,
                    binary: data.binary,
                    timestamp: data.timestamp
                });
            } else {
                setError(data.message || 'AI response failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('AI Chat error:', err);
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    const copyBinary = (binary) => {
        if (binary) {
            navigator.clipboard.writeText(binary)
                .then(() => alert('Binary copied to clipboard!'))
                .catch(() => alert('Failed to copy to clipboard'));
        }
    };

    return (
        <div className="binary-panel ai-terminal-panel">
            <h3 className="panel-title">AI Terminal Mode</h3>
            <div className="terminal-content">
                <div className="terminal-messages">
                    {aiMessages.length === 0 ? (
                        <div className="terminal-welcome">
                            <div className="welcome-message">
                                Welcome to AI Terminal Mode
                            </div>
                            <div className="welcome-subtitle">
                                Chat with AI using binary format
                            </div>
                        </div>
                    ) : (
                        aiMessages.map((message, index) => (
                            <div key={index} className={`terminal-message ${message.type}`}>
                                <div className="message-header">
                                    <span className="message-type">
                                        {message.type === 'user' ? 'USER' : 'AI'}
                                    </span>
                                    <span className="message-time">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="message-content">
                                    {message.content}
                                </div>
                                {message.binary && (
                                    <div className="message-binary">
                                        <div className="binary-display">{message.binary}</div>
                                        <button
                                            onClick={() => copyBinary(message.binary)}
                                            className="copy-binary-button"
                                        >
                                            COPY BINARY
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="terminal-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="terminal-input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="terminal-send-button"
                    >
                        {isLoading ? 'SENDING...' : 'SEND'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {aiMessages.length > 0 && (
                    <button
                        onClick={clearAiMessages}
                        className="clear-chat-button"
                        type="button"
                    >
                        CLEAR CHAT
                    </button>
                )}
            </div>
        </div>
    );
};

export default AITerminal;
