import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Home, Play, Clock, User, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { token, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        <div className="user-menu">
                            <span className="user-name">{user?.username}</span>
                            <button onClick={logout} className="btn-logout">
                                <LogOut size={18} />
                            </button>
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
