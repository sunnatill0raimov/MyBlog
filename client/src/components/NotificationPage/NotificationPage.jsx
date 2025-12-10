import React from 'react';
import { NotificationProvider } from './NotificationContext';
import NotificationList from './NotificationList';
import './notificationStyles.css';

const NotificationPage = () => {
    return (
        <NotificationProvider>
            <div className="notification-page">
                <div className="notification-header">
                    <h2 className="page-title">Notifications</h2>
                    <div className="page-subtitle">
                        Conversation alerts and system messages
                    </div>
                </div>

                <div className="filter-tabs">
                    <button className="filter-tab active">All</button>
                    <button className="filter-tab">Unread</button>
                    <button className="filter-tab">Read</button>
                </div>

                <NotificationList />
            </div>
        </NotificationProvider>
    );
};

export default NotificationPage;
