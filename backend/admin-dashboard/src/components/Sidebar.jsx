import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Clock, CheckCircle } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Autobees Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <Users size={20} /> Users
                </NavLink>
                <NavLink to="/dictionary" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <BookOpen size={20} /> Dictionary
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <Settings size={20} /> Settings
                </NavLink>
                <NavLink to="/suggestions" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <CheckCircle size={20} /> Suggestions
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <Clock size={20} /> History
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
