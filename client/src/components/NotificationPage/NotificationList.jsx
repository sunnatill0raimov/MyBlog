import React from 'react';
import { useNotificationContext } from './NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
    const { notifications, loading, error } = useNotificationContext();

    if (loading) {
        return (
            <div className="notification-loading">
                Loading notifications...
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-error">
                {error}
                <button onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="notification-empty">
                No notifications yet.
                <div className="empty-subtitle">
                    System awaiting activity...
                </div>
            </div>
        );
    }

    return (
        <div className="notification-list">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification._id}
                    notification={notification}
                />
            ))}
        </div>
    );
};

export default NotificationList;
