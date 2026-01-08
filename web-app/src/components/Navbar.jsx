import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Home, Play, Clock, User, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { token, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo Section (Right) */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🚌</span>
                    <span className="logo-text">أوتوبيس كومبليت</span>
                </Link>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation Links (Left) */}
                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <Home size={18} />
                        <span>الرئيسية</span>
                    </NavLink>

                    <NavLink to="/play" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <Play size={18} />
                        <span>العب الآن</span>
                    </NavLink>

                    {token && (
                        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                            <Clock size={18} />
                            <span>السجل</span>
                        </NavLink>
                    )}

                    {/* New Contact Us Link */}
                    <NavLink to="/how-to-play" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <HelpCircle size={18} />
                        <span>كيفية اللعب</span>
                    </NavLink>

                    <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <span>تواصل معنا</span>
                    </NavLink>

                    {token ? (
                        <div className="relative z-50">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 text-gray-700 font-bold hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                    {user?.profile_pic ? <img src={user.profile_pic} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
                                </div>
                                <span>{user?.username}</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden mx-2 sm:mx-0">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-sm text-gray-500">مرحباً،</p>
                                        <p className="font-bold text-gray-800 truncate">{user?.username}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                        onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                                    >
                                        <User size={18} />
                                        <span>تعديل الملف الشخصي</span>
                                    </Link>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button
                                        onClick={() => { logout(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-right"
                                    >
                                        <LogOut size={18} />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink to="/login" className="nav-btn-primary" onClick={() => setIsMenuOpen(false)}>
                            <User size={18} />
                            <span>دخول</span>
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
