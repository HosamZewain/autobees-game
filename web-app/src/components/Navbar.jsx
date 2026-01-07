import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚌</span>
          <span className="logo-text">أوتوبيس كومبليت</span>
        </Link>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links-wrapper ${isOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
                الرئيسية
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/play" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
                  العب الآن
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/about" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
                عن اللعبة
              </NavLink>
            </li>
          </ul>
          <div className="auth-btns">
            {user ? (
              <div className="user-nav">
                <span className="user-name">مرحباً، {user.username}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <LogOut size={16} />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-outline">
                  <LogIn size={18} />
                  <span>دخول</span>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary">
                  <UserPlus size={18} />
                  <span>تسجيل</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .navbar {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          height: 70px;
          display: flex;
          align-items: center;
          direction: rtl;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          position: relative;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 800;
          color: #1f2937;
          text-decoration: none;
        }
        .logo-icon { font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        
        .nav-links-wrapper {
            display: flex;
            align-items: center;
            gap: 40px;
        }

        .nav-links {
          display: flex;
          gap: 30px;
          align-items: center;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .nav-links a {
          font-weight: 700;
          color: #6b7280;
          font-size: 1rem;
          position: relative;
          transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active {
          color: #a855f7;
        }
        .nav-links a.active::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: 0; 
            width: 100%;
            height: 3px;
            background: #a855f7;
            border-radius: 2px;
        }

        .auth-btns { display: flex; gap: 12px; align-items: center; }
        .user-nav { display: flex; align-items: center; gap: 15px; }
        .user-name { font-weight: 700; color: #374151; font-size: 0.95rem; }
        
        .btn-sm { padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; }
        
        .mobile-menu-btn { display: none; color: #374151; }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: block; z-index: 1002; }
          .nav-links-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: white;
            flex-direction: column;
            justify-content: center;
            padding: 40px;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1001;
          }
          .nav-links-wrapper.open { transform: translateX(0); }
          .nav-links { flex-direction: column; gap: 30px; font-size: 1.2rem; }
          .auth-btns { flex-direction: column; width: 100%; gap: 15px; }
          .btn { width: 100%; justify-content: center; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
