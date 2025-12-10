import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="status-bar">
                <div className="status-item">
                    <span className="label">Status :</span>
                    <span className="value active">active</span>
                </div>
                <div className="status-item">
                    <span className="label">RANK:</span>
                    <span className="value">BINARY OPERATOR</span>
                </div>
                <div className="status-item">
                    <span className="label">USER-ID:</span>
                    <span className="value">01100001 01101110</span>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3 className="panel-title">Binary Bio</h3>
                <div className="panel-content binary-text">
                    <p>01001001 00100000 01101100 01101111 01110110 01100101</p>
                    <p>01110010 00100000 01100001 01101110 01101111 01101110 ...</p>
                    <div className="typing-cursor"></div>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3 className="panel-title">Statistics</h3>
                <div className="panel-content stats-grid">
                    <div className="stat-row">
                        <span className="stat-label">Messages Sent:</span>
                        <span className="stat-value">1523</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Binary Encoded:</span>
                        <span className="stat-value">30012 bits</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Contacts:</span>
                        <span className="stat-value">12</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Chats Joined:</span>
                        <span className="stat-value">5</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Terminal Themes:</span>
                        <span className="stat-value">Hacker Green</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
