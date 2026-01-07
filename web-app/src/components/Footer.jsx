import React from 'react';
import { Apple, PlayCircle, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-top">
          <div className="footer-logo">🚌</div>
          <p>أوتوبيس كومبليت</p>
        </div>

        <div className="footer-links">
          <a href="#">الشروط والأحكام</a>
          <span className="dot">•</span>
          <a href="/privacy">الخصوصية</a>
          <span className="dot">•</span>
          <a href="/about">عننا</a>
        </div>

        <div className="footer-social">
          <a href="#" className="social-icon"><Github size={20} /></a>
          <a href="#" className="social-icon"><Twitter size={20} /></a>
          <a href="#" className="social-icon"><Instagram size={20} /></a>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .footer {
          margin-top: auto;
          background: white;
          border-top: 1px solid #f3f4f6;
          padding: 40px 0 30px;
          text-align: center;
          direction: rtl;
        }
        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .footer-top { display: flex; align-items: center; gap: 10px; opacity: 0.8; }
        .footer-logo { font-size: 1.5rem; }
        .footer-top p { font-weight: 800; color: #1f2937; font-size: 1.1rem; }

        .footer-links {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #6b7280;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .footer-links a:hover { color: #a855f7; }
        .dot { color: #e5e7eb; }

        .footer-social { display: flex; gap: 15px; margin: 10px 0; }
        .social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4b5563;
            transition: all 0.2s;
        }
        .social-icon:hover {
            background: #a855f7;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(168, 85, 247, 0.2);
        }

        .copyright { color: #9ca3af; font-size: 0.8rem; }
      `}} />
    </footer>
  );
};

export default Footer;
