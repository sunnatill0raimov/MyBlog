import React from 'react';
import { BinaryProvider } from './BinaryContext';
import Encoder from './Encoder';
import Decoder from './Decoder';
import AITerminal from './AITerminal';
import LivePreview from './LivePreview';
import './BinaryTool.css';

const BinaryTool = () => {
    return (
        <BinaryProvider>
            <div className="binary-tool-container">
                <div className="welcome-block">
                    <h2 className="welcome-title">Binary Conversion Tool</h2>
                    <p className="welcome-subtitle">
                        Convert between text and binary, chat with AI using binary format
                    </p>
                </div>

                <div className="binary-tool-grid">
                    <div className="left-column">
                        <Encoder />
                        <div className="column-spacer"></div>
                        <Decoder />
                    </div>

                    <div className="right-column">
                        <LivePreview />
                        <div className="column-spacer"></div>
                        <AITerminal />
                    </div>
                </div>
            </div>
        </BinaryProvider>
    );
};

export default BinaryTool;
