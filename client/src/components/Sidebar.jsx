import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MessageSquare, Phone, Bell, User, Settings, LogOut, Terminal } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="hacker-sidebar">
            <div className="sidebar-header">
                <div className="avatar-frame">
                    <div className="hacker-avatar">
                        <User size={32} />
                    </div>
                </div>
                <h3 className="username">@{user?.username || 'anonim'}</h3>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Home size={20} />
                    <span>HOME</span>
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <MessageSquare size={20} />
                    <span>CHAT</span>
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Phone size={20} />
                    <span>CONTACT</span>
                </NavLink>
                <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Bell size={20} />
                    <span>NOTIFICATIONS</span>
                </NavLink>
                <NavLink to="/account" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <User size={20} />
                    <span>ACCOUNT</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Settings size={20} />
                    <span>SETTINGS</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>LOG OUT</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
