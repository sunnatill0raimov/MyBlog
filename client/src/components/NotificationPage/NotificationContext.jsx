import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [expandedItems, setExpandedItems] = useState({});

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user || !token) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setNotifications(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch notifications');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                return true;
            }
            return false;
        } catch (err) {
            console.error('Mark as read error:', err);
            return false;
        }
    };

    // Mark notification as unread
    const markAsUnread = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/unread`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead: false }
                            : notification
                    )
                );
                return true;
            }
            return false;
        } catch (err) {
            console.error('Mark as unread error:', err);
            return false;
        }
    };

    // Toggle notification expansion
    const toggleExpand = (notificationId) => {
        setExpandedItems(prev => ({
            ...prev,
            [notificationId]: !prev[notificationId]
        }));
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    // Refresh notifications
    const refresh = () => {
        fetchNotifications();
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [user, token]);

    return (
        <NotificationContext.Provider value={{
            notifications: filteredNotifications,
            loading,
            error,
            filter,
            setFilter,
            expandedItems,
            toggleExpand,
            markAsRead,
            markAsUnread,
            refresh,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
