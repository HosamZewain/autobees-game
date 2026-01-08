import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Play, Info, Shield, LogOut, LogIn, UserPlus, FileText, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { to: '/', icon: <Home size={20} />, label: 'الرئيسية', end: true },
        ...(user ? [{ to: '/play', icon: <Play size={20} />, label: 'العب الآن' }] : []),
        ...(user ? [{ to: '/history', icon: <History size={20} />, label: 'سجل الألعاب' }] : []),
        { to: '/about', icon: <Info size={20} />, label: 'عن اللعبة' },
        { to: '/privacy', icon: <Shield size={20} />, label: 'الخصوصية' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">🚌</span>
                    <h1 className="logo-text">أوتوبيس كومبليت</h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {user ? (
                    <div className="user-profile">
                        <div className="user-info">
                            <div className="avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="username">{user.username}</span>
                                <span className="user-role">لاعب</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn" title="تسجيل خروج">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="btn btn-outline full-width">
                            <LogIn size={18} />
                            <span>تسجيل دخول</span>
                        </Link>
                        <Link to="/register" className="btn btn-primary full-width">
                            <UserPlus size={18} />
                            <span>إنشاء حساب</span>
                        </Link>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .sidebar {
          width: 280px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(0,0,0,0.05); /* RTL: Border left */
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          z-index: 50;
        }

        .sidebar-header {
          padding: 30px 24px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #6b7280;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #f3f4f6;
          color: #a855f7;
          transform: translateX(-4px); /* RTL push left */
        }

        .nav-item.active {
          background: #f3e8ff;
          color: #a855f7;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(0,0,0,0.05);
          background: rgba(255,255,255,0.5);
        }

        .user-profile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 12px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f3f4f6;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: #a855f7;
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .logout-btn {
          color: #9ca3af;
          padding: 8px;
          border-radius: 8px;
        }

        .logout-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .full-width {
          width: 100%;
          justify-content: center;
        }
        `
            }} />
        </aside>
    );
};

export default Sidebar;
