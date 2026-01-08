import React from 'react';
import { Apple, PlayCircle, Github, Twitter, Instagram, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="flex items-center gap-2">
          <span className="footer-logo">🚌</span>
          <span className="font-bold">أوتوبيس كومبليت</span>
        </div>

        <div className="hidden md:block w-px h-4 bg-gray-300"></div>

        <div className="footer-links">
          <Link to="/how-to-play">كيفية اللعب</Link>
          <Link to="/terms">الشروط</Link>
          <Link to="/privacy">الخصوصية</Link>
        </div>

        <div className="hidden md:block w-px h-4 bg-gray-300"></div>

        <div className="footer-social">
          <a href="#" title="Google Play"><Smartphone size={16} /></a>
          <a href="#" title="App Store"><Apple size={16} /></a>
          <a href="#"><Github size={16} /></a>
          <a href="#"><Twitter size={16} /></a>
        </div>

        <div className="hidden md:block w-px h-4 bg-gray-300"></div>

        <div className="text-gray-400 text-xs">
          © {new Date().getFullYear()}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .footer {
          margin-top: auto;
          /* background: transparent; Removed white background */
          border-top: 1px solid rgba(0,0,0,0.05); /* Subtle border */
          padding: 20px 0; /* Reduced padding */
          text-align: center;
          direction: rtl;
          font-size: 0.85rem;
        }
        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center; /* Center everything */
          gap: 20px;
          opacity: 0.6; /* Make it subtle */
          transition: opacity 0.2s;
        }
        .footer-content:hover { opacity: 1; }
        
        .footer-logo { font-size: 1.2rem; }
        
        .footer-links {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .footer-links a { color: #4b5563; font-weight: 600; text-decoration: none; }
        .footer-links a:hover { color: #a855f7; }
        
        .footer-social { display: flex; gap: 10px; }
        .footer-social a { color: #6b7280; transition: color 0.2s; }
        .footer-social a:hover { color: #a855f7; }

        @media (max-width: 640px) {
            .footer-content { flex-direction: column; gap: 10px; }
        }
      `}} />
    </footer>
  );
};

export default Footer;
