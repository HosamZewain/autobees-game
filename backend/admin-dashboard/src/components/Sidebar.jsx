import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Clock, CheckCircle, Mail, Sparkles } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`;

    return (
        <div className="w-64 bg-gray-900 h-screen flex flex-col text-white fixed left-0 top-0 overflow-y-auto z-50">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Autobees</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 flex flex-col gap-1">
                <div className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-2">Main Menu</div>

                <NavLink to="/" className={navLinkClass}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/users" className={navLinkClass}>
                    <Users size={20} /> Users
                </NavLink>
                <NavLink to="/messages" className={navLinkClass}>
                    <Mail size={20} /> Messages
                </NavLink>

                <div className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-6">Game Data</div>

                <NavLink to="/dictionary" className={navLinkClass}>
                    <BookOpen size={20} /> Dictionary
                </NavLink>
                <NavLink to="/suggestions" className={navLinkClass}>
                    <CheckCircle size={20} /> Suggestions
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                    <Clock size={20} /> Match History
                </NavLink>

                <div className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-6">System</div>

                <NavLink to="/settings" className={navLinkClass}>
                    <Settings size={20} /> Settings
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
