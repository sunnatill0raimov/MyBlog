import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const Icons = {
    User: ({ size = 24, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
    ),
    Camera: ({ size = 20, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    ),
    Edit: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    Save: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
        </svg>
    ),
    Eye: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    Shield: ({ size = 20, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Check: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    ),
    X: ({ size = 18, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
};

const avatarOptions = [
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Felix',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Bubba',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Milo',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Luna',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Charlie',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Max',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Bella',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Oscar',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Ruby',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Leo',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Coco',
];

const Account = () => {
    const { user, token } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        bio: '',
        avatar: '',
        isAnonymous: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                displayName: user.displayName || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: user.avatar || avatarOptions[0],
                isAnonymous: user.isAnonymous || false,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAvatarSelect = (avatarUrl) => {
        setFormData(prev => ({ ...prev, avatar: avatarUrl }));
        setShowAvatarPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...storedUser, ...data.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Reload to update context
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Icons.User size={28} color="#00ff41" />
                <h1 style={styles.title}>Account Settings</h1>
            </div>

            <div style={styles.content}>
                {/* Avatar Section */}
                <div style={styles.avatarSection}>
                    <div style={styles.avatarContainer}>
                        <img
                            src={formData.avatar || avatarOptions[0]}
                            alt="Avatar"
                            style={styles.avatar}
                        />
                        <button
                            onClick={() => setShowAvatarPicker(true)}
                            style={styles.avatarEditButton}
                        >
                            <Icons.Camera size={16} color="#0d1117" />
                        </button>
                    </div>
                    <div style={styles.avatarInfo}>
                        <h3 style={styles.displayName}>
                            {formData.isAnonymous ? 'Anonymous' : (formData.displayName || formData.username)}
                        </h3>
                        <p style={styles.usernameLabel}>@{formData.username}</p>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div style={{
                        ...styles.message,
                        backgroundColor: message.type === 'success' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        borderColor: message.type === 'success' ? '#00ff41' : '#ff6b6b',
                        color: message.type === 'success' ? '#00ff41' : '#ff6b6b',
                    }}>
                        {message.type === 'success' ? <Icons.Check /> : <Icons.X />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Anonymous Mode Toggle */}
                    <div style={styles.anonymousSection}>
                        <div style={styles.anonymousHeader}>
                            <Icons.Shield size={20} color={formData.isAnonymous ? '#00ff41' : '#666'} />
                            <span style={styles.anonymousTitle}>Anonymous Mode</span>
                        </div>
                        <p style={styles.anonymousDescription}>
                            When enabled, others will see your name as "Anonymous" in chats
                        </p>
                        <label style={styles.toggleContainer}>
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                                style={styles.toggleInput}
                            />
                            <span style={{
                                ...styles.toggleSwitch,
                                backgroundColor: formData.isAnonymous ? '#00ff41' : '#333'
                            }}>
                                <span style={{
                                    ...styles.toggleKnob,
                                    transform: formData.isAnonymous ? 'translateX(24px)' : 'translateX(0)'
                                }}></span>
                            </span>
                            <span style={styles.toggleLabel}>
                                {formData.isAnonymous ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    {/* Display Name */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="Your display name"
                            style={styles.input}
                            maxLength={30}
                        />
                        <span style={styles.hint}>This is how others see you (unless anonymous)</span>
                    </div>

                    {/* Username */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Your username"
                            style={styles.input}
                            maxLength={20}
                        />
                        <span style={styles.hint}>Unique identifier, lowercase only</span>
                    </div>

                    {/* Email */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            style={styles.input}
                        />
                    </div>

                    {/* Bio */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            style={styles.textarea}
                            maxLength={500}
                            rows={3}
                        />
                        <span style={styles.hint}>{formData.bio.length}/500 characters</span>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" style={styles.submitButton} disabled={loading}>
                        {loading ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Icons.Save />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div style={styles.modalOverlay} onClick={() => setShowAvatarPicker(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Choose Avatar</h3>
                            <button onClick={() => setShowAvatarPicker(false)} style={styles.closeButton}>
                                <Icons.X />
                            </button>
                        </div>
                        <div style={styles.avatarGrid}>
                            {avatarOptions.map((avatarUrl, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleAvatarSelect(avatarUrl)}
                                    style={{
                                        ...styles.avatarOption,
                                        border: formData.avatar === avatarUrl ? '3px solid #00ff41' : '3px solid transparent',
                                        boxShadow: formData.avatar === avatarUrl ? '0 0 20px rgba(0, 255, 65, 0.3)' : 'none'
                                    }}
                                >
                                    <img src={avatarUrl} alt={`Avatar ${index + 1}`} style={styles.avatarOptionImg} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
    },
    title: {
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        margin: 0,
        fontFamily: "'JetBrains Mono', monospace",
    },
    content: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(0, 255, 65, 0.1)',
    },
    avatarSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '32px',
        paddingBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '3px solid #00ff41',
        backgroundColor: '#1f2937',
    },
    avatarEditButton: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#00ff41',
        border: '3px solid #0d1117',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInfo: {
        flex: 1,
    },
    displayName: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '700',
        margin: '0 0 4px 0',
    },
    usernameLabel: {
        color: '#00ff41',
        fontSize: '14px',
        margin: 0,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid',
        marginBottom: '24px',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    anonymousSection: {
        background: 'rgba(0, 255, 65, 0.05)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(0, 255, 65, 0.15)',
    },
    anonymousHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
    },
    anonymousTitle: {
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '600',
    },
    anonymousDescription: {
        color: '#888',
        fontSize: '13px',
        margin: '0 0 16px 0',
    },
    toggleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
    },
    toggleInput: {
        display: 'none',
    },
    toggleSwitch: {
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        position: 'relative',
        transition: 'all 0.3s',
    },
    toggleKnob: {
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        transition: 'transform 0.3s',
    },
    toggleLabel: {
        color: '#888',
        fontSize: '14px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        color: '#888',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    input: {
        padding: '14px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(0, 255, 65, 0.2)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '15px',
        outline: 'none',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 0.2s',
    },
    textarea: {
        padding: '14px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(0, 255, 65, 0.2)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '15px',
        outline: 'none',
        fontFamily: "'JetBrains Mono', monospace",
        resize: 'vertical',
        minHeight: '80px',
    },
    hint: {
        color: '#555',
        fontSize: '12px',
    },
    submitButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        backgroundColor: '#00ff41',
        border: 'none',
        borderRadius: '10px',
        color: '#0d1117',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '16px',
        transition: 'all 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
    },
    modal: {
        backgroundColor: '#0d1117',
        border: '1px solid rgba(0, 255, 65, 0.3)',
        borderRadius: '16px',
        width: '450px',
        maxHeight: '80vh',
        overflow: 'hidden',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(0, 255, 65, 0.1)',
    },
    modalTitle: {
        color: '#00ff41',
        fontSize: '18px',
        fontWeight: '700',
        margin: 0,
    },
    closeButton: {
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: '8px',
        color: '#666',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        padding: '24px',
    },
    avatarOption: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        overflow: 'hidden',
    },
    avatarOptionImg: {
        width: '100%',
        height: '100%',
    },
};

export default Account;
