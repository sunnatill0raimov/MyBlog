import React from 'react';
import { useNotificationContext } from './NotificationContext';

const NotificationItem = ({ notification }) => {
    const { toggleExpand, expandedItems, markAsRead, markAsUnread } = useNotificationContext();

    const isExpanded = expandedItems[notification._id] || false;
    const isRead = notification.isRead || false;

    const handleBellClick = async () => {
        if (isRead) {
            await markAsUnread(notification._id);
        } else {
            await markAsRead(notification._id);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className={`notification-item ${isRead ? 'read' : 'unread'}`}>
            <div className="notification-header">
                <div className="notification-bell" onClick={handleBellClick}>
                    {isRead ? '🔔' : '🔔'}
                </div>
                <div className="notification-title">{notification.title}</div>
                <button
                    className="expand-button"
                    onClick={() => toggleExpand(notification._id)}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>

            {isExpanded && (
                <div className="notification-details">
                    <div className="notification-preview">
                        {notification.preview}
                    </div>
                    <div className="notification-time">
                        {formatTime(notification.createdAt)}
                    </div>
                    <button
                        className="mark-read-button"
                        onClick={() => isRead ? markAsUnread(notification._id) : markAsRead(notification._id)}
                    >
                        {isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
