import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import SEO from '../components/SEO';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      const pendingRoomId = localStorage.getItem('pendingRoomId');
      if (pendingRoomId) {
        localStorage.removeItem('pendingRoomId');
        navigate(`/play/multiplayer?join=${pendingRoomId}`);
      } else {
        navigate('/play');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page container">
      <SEO title="تسجيل الدخول" description="قم بتسجيل الدخول إلى حسابك في أوتوبيس كومبليت لمنافسة أصدقائك وحفظ تقدمك." />
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-box"><LogIn size={32} /></div>
          <h2>تسجيل الدخول</h2>
          <p>أهلاً بك مجدداً في أوتوبيس كومبليت</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-with-icon">
              <Mail size={20} />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-with-icon">
              <Lock size={20} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'جاري التحميل...' : 'دخول'}
          </button>
        </form>

        <p className="auth-footer">
          ليس لديك حساب؟ <Link to="/register">سجل الآن</Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 85vh;
          direction: rtl;
          padding: 40px 20px 100px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          text-align: center;
          background: white;
          padding: 40px 30px;
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(255,255,255,0.8);
        }
        .auth-header { margin-bottom: 30px; }
        .icon-box {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);
          transform: rotate(-3deg);
        }
        .auth-header h2 { font-size: 1.8rem; margin-bottom: 8px; font-weight: 800; color: #1f2937; }
        .auth-header p { color: #6b7280; font-size: 0.95rem; }

        .auth-form { text-align: right; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          color: #374151;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon svg {
          position: absolute;
          right: 15px;
          color: #9ca3af;
          pointer-events: none;
        }
        .input-with-icon input {
          width: 100%;
          padding: 14px 45px 14px 15px;
          border: 2px solid #f3f4f6;
          border-radius: 16px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          background: #f9fafb;
          color: #1f2937;
        }
        .input-with-icon input:focus {
          border-color: #a855f7;
          background: white;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
        }
        .btn-full { 
            width: 100%; 
            justify-content: center; 
            margin-top: 15px; 
            padding: 16px;
            font-size: 1.1rem;
            font-weight: 700;
            border-radius: 16px;
            background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
            box-shadow: 0 10px 25px rgba(124, 58, 237, 0.25);
            border: none;
        }
        .btn-full:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(124, 58, 237, 0.35);
        }
        
        .auth-footer { margin-top: 30px; color: #6b7280; font-size: 0.95rem; }
        .auth-footer a { color: #7c3aed; font-weight: 700; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
        
        .alert {
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 25px;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
        }
        .alert-error {
          background-color: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }
      `}} />
    </div>
  );
};

export default Login;
