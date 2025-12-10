import React from 'react';
import { useBinaryContext } from './BinaryContext';

const LivePreview = () => {
    const { livePreview } = useBinaryContext();

    if (!livePreview) {
        return (
            <div className="binary-panel live-preview-panel">
                <h3 className="panel-title">Live Preview</h3>
                <div className="panel-content">
                    <div className="preview-placeholder">
                        Preview will appear here as you type...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="binary-panel live-preview-panel">
            <h3 className="panel-title">Live Preview</h3>
            <div className="panel-content">
                <div className="preview-content">
                    <div className="preview-section">
                        <span className="preview-label">Input:</span>
                        <span className="preview-value">{livePreview.input}</span>
                    </div>

                    <div className="preview-section">
                        <span className="preview-label">Binary:</span>
                        <span className="preview-value binary-preview">
                            {livePreview.binary}
                        </span>
                    </div>

                    <div className="preview-info">
                        {livePreview.type === 'encode' ? (
                            <>
                                <span>Text length: {livePreview.input.length}</span>
                                <span>Binary length: {livePreview.binary.length}</span>
                            </>
                        ) : (
                            <>
                                <span>Binary bits: {livePreview.input.replace(/\s+/g, '').length}</span>
                                <span>Decoded length: {livePreview.binary.length}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePreview;
