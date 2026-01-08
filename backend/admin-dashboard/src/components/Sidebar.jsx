import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Clock, CheckCircle, Mail } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        isActive ? 'sidebar-link active' : 'sidebar-link';

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Autobees Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className={navLinkClass}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/users" className={navLinkClass}>
                    <Users size={20} /> Users
                </NavLink>
                <NavLink to="/dictionary" className={navLinkClass}>
                    <BookOpen size={20} /> Dictionary
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                    <Clock size={20} /> History
                </NavLink>
                <NavLink to="/messages" className={navLinkClass}>
                    <Mail size={20} /> Messages
                </NavLink>
                <NavLink to="/settings" className={navLinkClass}>
                    <Settings size={20} /> Settings
                </NavLink>
                <NavLink to="/suggestions" className={navLinkClass}>
                    <CheckCircle size={20} /> Suggestions
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
