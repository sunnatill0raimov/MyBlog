import React, { createContext, useContext, useState } from 'react';

const BinaryContext = createContext();

export const BinaryProvider = ({ children }) => {
    const [livePreview, setLivePreview] = useState(null);
    const [aiMessages, setAiMessages] = useState([]);

    const addAiMessage = (message) => {
        setAiMessages(prev => [...prev, message]);
    };

    const clearAiMessages = () => {
        setAiMessages([]);
    };

    return (
        <BinaryContext.Provider value={{
            livePreview,
            setLivePreview,
            aiMessages,
            addAiMessage,
            clearAiMessages
        }}>
            {children}
        </BinaryContext.Provider>
    );
};

export const useBinaryContext = () => {
    const context = useContext(BinaryContext);
    if (!context) {
        throw new Error('useBinaryContext must be used within a BinaryProvider');
    }
    return context;
};
