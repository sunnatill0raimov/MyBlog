import React, { useState } from 'react';
import { X, Users, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './GroupChatModal.css';

const GroupChatModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Create new group (only name required)
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError('Guruh nomini kiriting');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/chat/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: groupName,
                    users: JSON.stringify([]), // Empty users - creator will be added automatically
                }),
            });

            if (!response.ok) {
                throw new Error('Guruh yaratishda xatolik');
            }

            const data = await response.json();
            onGroupCreated(data);
            setGroupName('');
            onClose();
        } catch (error) {
            console.error("Failed to create group", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Search for existing groups
    const handleSearchGroups = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`/api/chat/search?search=${query}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to search groups", error);
            setSearchResults([]);
        }
    };

    // Join an existing group
    const handleJoinGroup = async (chatId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/chat/groupjoin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    chatId: chatId,
                }),
            });

            if (!response.ok) {
                throw new Error('Guruhga qo\'shilishda xatolik');
            }

            const data = await response.json();
            onGroupCreated(data);
            onClose();
        } catch (error) {
            console.error("Failed to join group", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{activeTab === 'create' ? 'YANGI GURUH' : 'GURUHGA QO\'SHILISH'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Tab Switcher */}
                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <Users size={16} />
                        Yaratish
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
                        onClick={() => setActiveTab('join')}
                    >
                        <Search size={16} />
                        Qo'shilish
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="modal-error">{error}</div>}

                    {activeTab === 'create' ? (
                        /* Create Group Tab */
                        <div className="form-group">
                            <label>GURUH NOMI</label>
                            <input
                                type="text"
                                placeholder="Masalan: Developers UZ..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                            />
                            <p className="form-hint">
                                Boshqa foydalanuvchilar bu guruhni qidirib topishi va qo'shilishi mumkin.
                            </p>
                        </div>
                    ) : (
                        /* Join Group Tab */
                        <>
                            <div className="form-group">
                                <label>GURUH QIDIRISH</label>
                                <input
                                    type="text"
                                    placeholder="Guruh nomini kiriting..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchGroups(e.target.value)}
                                />
                            </div>

                            <div className="search-results">
                                {searchResults.length > 0 ? (
                                    searchResults.map((group) => (
                                        <div key={group._id} className="group-result">
                                            <div className="group-avatar">
                                                <Users size={20} />
                                            </div>
                                            <div className="group-info">
                                                <span className="group-name">{group.chatName}</span>
                                                <span className="group-members">
                                                    {group.users?.length || 0} a'zo
                                                </span>
                                            </div>
                                            <button
                                                className="join-btn"
                                                onClick={() => handleJoinGroup(group._id)}
                                                disabled={loading}
                                            >
                                                {loading ? '...' : 'Qo\'shilish'}
                                            </button>
                                        </div>
                                    ))
                                ) : searchQuery ? (
                                    <p className="no-results">Guruh topilmadi</p>
                                ) : (
                                    <p className="no-results">Guruh nomini yozing...</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {activeTab === 'create' && (
                    <div className="modal-footer">
                        <button
                            className="submit-btn"
                            onClick={handleCreateGroup}
                            disabled={loading || !groupName.trim()}
                        >
                            {loading ? '[ YARATILMOQDA... ]' : '[ GURUH YARATISH ]'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupChatModal;
