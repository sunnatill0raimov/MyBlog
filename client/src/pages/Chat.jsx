import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import GroupChatModal from '../components/GroupChatModal';
import './Chat.css';

const ENDPOINT = 'http://localhost:3003';
let socket;
let typingTimeout;

const Chat = () => {
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typing, setTyping] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const messagesEndRef = useRef(null);
    const selectedChatRef = useRef(selectedChat);

    // Keep selectedChat ref in sync
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

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
            if (selectedChatRef.current?._id === room) {
                setIsTyping(true);
            }
        });

        socket.on("stop typing", (room) => {
            if (selectedChatRef.current?._id === room) {
                setIsTyping(false);
            }
        });

        // GLOBAL message listener - catches all incoming messages
        socket.on("message received", (newMessageReceived) => {
            const currentChat = selectedChatRef.current;

            if (!currentChat || currentChat._id !== newMessageReceived.chat?._id) {
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

    // Fetch Chats on mount
    useEffect(() => {
        const fetchChats = async () => {
            const token = localStorage.getItem('token');
            if (!user || !token) return;

            try {
                const response = await fetch('/api/chat', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chats');
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    setChats(data);
                } else {
                    setChats([]);
                }
            } catch (error) {
                console.error("Failed to fetch chats", error);
                setChats([]);
            }
        };
        fetchChats();
    }, [user]);

    // Fetch Messages when chat selected
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/message/${selectedChat._id}`, {
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
                    socket.emit("join chat", selectedChat._id);
                }

                // Clear notifications for this chat
                setNotifications(prev => prev.filter(n => n.chat?._id !== selectedChat._id));
            } catch (error) {
                console.error("Failed to fetch messages", error);
                setMessages([]);
            }
        };
        fetchMessages();

    }, [selectedChat]);

    // Handle typing
    const handleTyping = (e) => {
        setMessageInput(e.target.value);

        if (!socketConnected || !selectedChat) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        // Clear previous timeout
        if (typingTimeout) clearTimeout(typingTimeout);

        // Stop typing after 3 seconds
        typingTimeout = setTimeout(() => {
            socket.emit("stop typing", selectedChat._id);
            setTyping(false);
        }, 3000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChat) {
            // Stop typing indicator
            socket.emit("stop typing", selectedChat._id);
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
                        chatId: selectedChat._id
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

    const getSender = (loggedUser, users) => {
        if (!loggedUser || !users || !Array.isArray(users) || users.length < 2) return "Unknown";
        const otherUser = users.find(u => u._id !== loggedUser._id && u._id !== loggedUser.id);
        return otherUser?.username || "Unknown";
    };

    const getChatName = (chat) => {
        if (!chat) return "Chat";
        if (chat.isGroupChat) return chat.chatName || "Group";
        return getSender(user, chat.users);
    };

    const getChatAvatar = (chat) => {
        const name = getChatName(chat);
        return name?.[0]?.toUpperCase() || "?";
    };

    const getUnreadCount = (chatId) => {
        return notifications.filter(n => n.chat._id === chatId).length;
    };

    const handleGroupCreated = (newGroup) => {
        setChats([newGroup, ...chats]);
        setIsGroupModalOpen(false);
    };

    const handleLeaveGroup = async () => {
        if (!selectedChat || !selectedChat.isGroupChat) return;

        try {
            const response = await fetch('/api/chat/groupremove', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    userId: user._id || user.id
                })
            });

            if (response.ok) {
                setChats(chats.filter(c => c._id !== selectedChat._id));
                setSelectedChat(null);
                setShowChatMenu(false);
            }
        } catch (error) {
            console.error("Failed to leave group", error);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowChatMenu(false);
        if (showChatMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showChatMenu]);

    return (
        <div className="chat-container">
            {/* Left Sidebar: Chat List */}
            <div className="chat-sidebar">
                <div className="chat-search">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="SEARCH CHATS..." />
                </div>

                <div className="chat-list">
                    {chats.map((chat) => {
                        const unreadCount = getUnreadCount(chat._id);
                        return (
                            <div
                                key={chat._id}
                                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-avatar">
                                    {getChatAvatar(chat)}
                                    {unreadCount > 0 && (
                                        <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </div>
                                <div className="chat-info">
                                    <div className="chat-header">
                                        <h4>{getChatName(chat)}</h4>
                                    </div>
                                    {chat.latestMessage && chat.latestMessage.sender && (
                                        <p className="chat-preview">
                                            <b>{chat.latestMessage.sender.username || 'User'}: </b>
                                            {chat.latestMessage.content?.length > 30
                                                ? chat.latestMessage.content.substring(0, 30) + "..."
                                                : chat.latestMessage.content || ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="add-chat-btn" onClick={() => setIsGroupModalOpen(true)}>
                        <span>+ Yangi Chat</span>
                    </div>
                </div>
            </div>

            <GroupChatModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onGroupCreated={handleGroupCreated}
            />

            {/* Right Content: Chat Area */}
            <div className="chat-area">
                {selectedChat ? (
                    <>
                        <div className="chat-header-bar">
                            <div className="chat-user-info">
                                <h3>{getChatName(selectedChat)}</h3>
                                <span className="status">
                                    {isTyping ? (
                                        <span className="typing-text">yozmoqda...</span>
                                    ) : selectedChat.isGroupChat
                                        ? `${selectedChat.users?.length || 0} a'zo`
                                        : (socketConnected ? 'Online' : 'Connecting...')}
                                </span>
                            </div>
                            <div className="chat-actions">
                                <div className="menu-container">
                                    <button
                                        className="menu-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowChatMenu(!showChatMenu);
                                        }}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    {showChatMenu && (
                                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                            {selectedChat.isGroupChat && (
                                                <button className="menu-item danger" onClick={handleLeaveGroup}>
                                                    <LogOut size={16} />
                                                    Guruhdan chiqish
                                                </button>
                                            )}
                                            <button className="menu-item" onClick={() => {
                                                setShowChatMenu(false);
                                                setShowMembersModal(true);
                                            }}>
                                                <Users size={16} />
                                                A'zolarni ko'rish
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
                    <div className="no-chat-selected">
                        <div className="terminal-loader">
                            <div className="terminal-header">
                                <span className="terminal-title">system_status</span>
                            </div>
                            <div className="terminal-content">
                                <p>&gt; WAITING FOR CONNECTION...</p>
                                <p>&gt; SELECT A CHAT TO BEGIN</p>
                                <p className="blinking-cursor">_</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Members Modal */}
            {showMembersModal && selectedChat && (
                <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
                    <div className="members-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="members-header">
                            <h3>
                                <Users size={20} />
                                {selectedChat.isGroupChat ? selectedChat.chatName : 'Chat'} - A'zolar
                            </h3>
                            <button className="close-btn" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>
                        <div className="members-list">
                            {selectedChat.users?.map((member) => (
                                <div key={member._id || member} className="member-item">
                                    <div className="member-avatar">
                                        {member.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">
                                            {member.username || 'Unknown User'}
                                            {selectedChat.groupAdmin?._id === member._id && (
                                                <span className="admin-badge">Admin</span>
                                            )}
                                            {(member._id === user._id || member._id === user.id) && (
                                                <span className="you-badge">Siz</span>
                                            )}
                                        </span>
                                        <span className="member-email">{member.email || ''}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="members-footer">
                            <span className="member-count">{selectedChat.users?.length || 0} a'zo</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
