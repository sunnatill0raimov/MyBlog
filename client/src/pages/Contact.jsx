import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, UserPlus, Phone, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './Contact.css';

const ENDPOINT = 'http://localhost:3003';
let socket;
let typingTimeout;

const Contact = () => {
    const { user } = useAuth();
    const [selectedContact, setSelectedContact] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [showContactMenu, setShowContactMenu] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typing, setTyping] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const messagesEndRef = useRef(null);
    const selectedContactRef = useRef(selectedContact);

    // Keep selectedContact ref in sync
    useEffect(() => {
        selectedContactRef.current = selectedContact;
    }, [selectedContact]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Connect to Socket.io
    useEffect(() => {
        if (!user) return;

        socket = io(ENDPOINT);
        // Ensure user has _id for socket room
        const userData = {
            ...user,
            _id: user._id || user.id
        };
        socket.emit("setup", userData);
        socket.on("connected", () => setSocketConnected(true));

        // Listen for typing events
        socket.on("typing", (room) => {
            if (selectedContactRef.current?._id === room) {
                setIsTyping(true);
            }
        });

        socket.on("stop typing", (room) => {
            if (selectedContactRef.current?._id === room) {
                setIsTyping(false);
            }
        });

        // GLOBAL message listener - catches all incoming messages
        socket.on("message received", (newMessageReceived) => {
            const currentContact = selectedContactRef.current;

            if (!currentContact || currentContact._id !== newMessageReceived.chat?._id) {
                // Not in this chat - add to notifications (unread)
                setNotifications(prev => {
                    // Avoid duplicates
                    if (prev.some(n => n._id === newMessageReceived._id)) {
                        return prev;
                    }
                    return [...prev, newMessageReceived];
                });
            } else {
                // In this chat - add to messages
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        });

        return () => {
            socket.off("message received");
            socket.off("typing");
            socket.off("stop typing");
            socket.off("connected");
            socket.disconnect();
        };
    }, [user]);

    // Fetch Contacts on mount
    useEffect(() => {
        const fetchContacts = async () => {
            const token = localStorage.getItem('token');
            if (!user || !token) return;

            try {
                const response = await fetch('/api/chat', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch contacts');
                }

                const data = await response.json();
                // Filter to show only individual contacts (not groups)
                const individualContacts = Array.isArray(data)
                    ? data.filter(chat => !chat.isGroupChat)
                    : [];

                setContacts(individualContacts);
            } catch (error) {
                console.error("Failed to fetch contacts", error);
                setContacts([]);
            }
        };
        fetchContacts();
    }, [user]);

    // Fetch Messages when contact selected
    useEffect(() => {
        if (!selectedContact) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/message/${selectedContact._id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    setMessages([]);
                    return;
                }

                const data = await response.json();
                setMessages(Array.isArray(data) ? data : []);

                // Join the chat room for real-time updates
                if (socket) {
                    socket.emit("join chat", selectedContact._id);
                }

                // Clear notifications for this contact
                setNotifications(prev => prev.filter(n => n.chat?._id !== selectedContact._id));
            } catch (error) {
                console.error("Failed to fetch messages", error);
                setMessages([]);
            }
        };
        fetchMessages();

    }, [selectedContact]);

    // Handle typing
    const handleTyping = (e) => {
        setMessageInput(e.target.value);

        if (!socketConnected || !selectedContact) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedContact._id);
        }

        // Clear previous timeout
        if (typingTimeout) clearTimeout(typingTimeout);

        // Stop typing after 3 seconds
        typingTimeout = setTimeout(() => {
            socket.emit("stop typing", selectedContact._id);
            setTyping(false);
        }, 3000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageInput.trim() && selectedContact) {
            // Stop typing indicator
            socket.emit("stop typing", selectedContact._id);
            setTyping(false);

            try {
                const response = await fetch('/api/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        content: messageInput,
                        chatId: selectedContact._id
                    })
                });
                const data = await response.json();

                socket.emit("new message", data);
                setMessages([...messages, data]);
                setMessageInput('');
            } catch (error) {
                console.error("Failed to send message", error);
            }
        }
    };

    const getContactName = (contact) => {
        if (!contact) return "Contact";
        if (contact.isGroupChat) return contact.chatName || "Group";
        return getSender(user, contact.users);
    };

    const getSender = (loggedUser, users) => {
        if (!loggedUser || !users || !Array.isArray(users) || users.length < 2) return "Unknown";
        const otherUser = users.find(u => u._id !== loggedUser._id && u._id !== loggedUser.id);
        return otherUser?.username || "Unknown";
    };

    const getContactAvatar = (contact) => {
        const name = getContactName(contact);
        return name?.[0]?.toUpperCase() || "?";
    };

    const getUnreadCount = (contactId) => {
        return notifications.filter(n => n.chat._id === contactId).length;
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowContactMenu(false);
        if (showContactMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showContactMenu]);

    return (
        <div className="contact-container">
            {/* Left Sidebar: Contact List */}
            <div className="contact-sidebar">
                <div className="contact-search">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="SEARCH CONTACTS..." />
                </div>

                <div className="contact-list">
                    {contacts.map((contact) => {
                        const unreadCount = getUnreadCount(contact._id);
                        return (
                            <div
                                key={contact._id}
                                className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="contact-avatar">
                                    {getContactAvatar(contact)}
                                    {unreadCount > 0 && (
                                        <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <h4>{getContactName(contact)}</h4>
                                    </div>
                                    {contact.latestMessage && contact.latestMessage.sender && (
                                        <p className="contact-preview">
                                            <b>{contact.latestMessage.sender.username || 'User'}: </b>
                                            {contact.latestMessage.content?.length > 30
                                                ? contact.latestMessage.content.substring(0, 30) + "..."
                                                : contact.latestMessage.content || ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="add-contact-btn">
                        <span>+ Yangi Contact</span>
                    </div>
                </div>
            </div>

            {/* Right Content: Contact Area */}
            <div className="contact-area">
                {selectedContact ? (
                    <>
                        <div className="contact-header-bar">
                            <div className="contact-user-info">
                                <h3>{getContactName(selectedContact)}</h3>
                                <span className="status">
                                    {isTyping ? (
                                        <span className="typing-text">yozmoqda...</span>
                                    ) : (socketConnected ? 'Online' : 'Connecting...')}
                                </span>
                            </div>
                            <div className="contact-actions">
                                <div className="action-buttons">
                                    <button className="action-btn" title="Audio call">
                                        <Phone size={18} />
                                    </button>
                                    <button className="action-btn" title="Video call">
                                        <Video size={18} />
                                    </button>
                                </div>
                                <div className="menu-container">
                                    <button
                                        className="menu-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowContactMenu(!showContactMenu);
                                        }}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    {showContactMenu && (
                                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                            <button className="menu-item" onClick={() => setShowContactMenu(false)}>
                                                <UserPlus size={16} />
                                                Contact ma'lumotlari
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`message ${msg.sender?._id === (user._id || user.id) ? 'message-me' : 'message-other'}`}
                                >
                                    <div className="message-content">
                                        {msg.sender?._id !== (user._id || user.id) && (
                                            <span className="message-sender">// {msg.sender?.username || 'User'}</span>
                                        )}
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="typing-indicator">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="TYPE A MESSAGE..."
                                value={messageInput}
                                onChange={handleTyping}
                            />
                            <button type="submit">
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-contact-selected">
                        <div className="terminal-loader">
                            <div className="terminal-header">
                                <span className="terminal-title">contact_system</span>
                            </div>
                        <div className="terminal-content">
                            <p>{'>'} WAITING FOR CONNECTION...</p>
                            <p>{'>'} SELECT A CONTACT TO BEGIN</p>
                            <p className="blinking-cursor">_</p>
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contact;
