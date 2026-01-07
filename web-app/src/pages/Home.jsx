import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Users, Zap, Play, User, Crown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token } = useAuth();
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/leaderboard');
        setTopPlayers(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="mobile-home-landing container">
      {/* Hero Section */}
      <div className="greeting-box">
        <div className="bus-logo">
          <span style={{ fontSize: '80px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🚌</span>
        </div>
        <h3 className="subtitle">التحدي الأمثل لعبة الكلمات</h3>
        <h1>أوتوبيس كومبليت</h1>
      </div>

      <div className="menue-buttons">
        <Link to="/play" className="menu-btn btn-green">
          <div className="btn-icon"><Play size={24} fill="currentColor" /></div>
          <div className="btn-text">
            <span>العب الآن</span>
            <small>ابدأ التحدي فوراً</small>
          </div>
        </Link>


        {!token && (
          <Link to="/register" className="menu-btn btn-purple">
            <div className="btn-icon"><User size={24} fill="currentColor" /></div>
            <div className="btn-text">
              <span>دخول / تسجيل</span>
              <small>احفظ تقدمك ونافس</small>
            </div>
          </Link>
        )}
      </div>

      {/* Mini Features Grid */}
      <div className="features-mini-grid">
        <div className="mini-card">
          <div className="mini-icon icon-purple"><Users size={20} /></div>
          <span>لعب جماعي</span>
        </div>
        <div className="mini-card">
          <div className="mini-icon icon-orange"><Zap size={20} /></div>
          <span>تحدي السرعة</span>
        </div>
        <div className="mini-card">
          <div className="mini-icon icon-green"><Trophy size={20} /></div>
          <span>التصنيفات</span>
        </div>
      </div>

      {/* Leaderboard Section (Simplified for Mobile) */}
      <section className="leaderboard-section">
        <div className="section-header">
          <h2>أفضل اللاعبين 👑</h2>
        </div>

        <div className="leaderboard-list">
          {topPlayers.length > 0 ? (
            topPlayers.slice(0, 3).map((player, index) => (
              <div key={index} className="player-row">
                <div className="rank">#{index + 1}</div>
                <div className="player-details">
                  <strong>{player.username}</strong>
                </div>
                <div className="score-badge">{player.total_score}</div>
              </div>
            ))
          ) : (
            <div className="no-data">كن أول من يتصدر القائمة!</div>
          )}
        </div>
      </section>

      <div className="home-footer">
        <p>© 2024 أوتوبيس كومبليت. جميع الحقوق محفوظة.</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mobile-home-landing {
            max-width: 480px;
            margin: 0 auto;
            padding: 40px 24px;
            text-align: center;
            direction: rtl;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: radial-gradient(circle at top, #fdf4ff 0%, #ffffff 100%);
        }

        .greeting-box { margin-bottom: 40px; position: relative; }
        .bus-logo { 
            width: 140px; 
            height: 140px; 
            background: white; 
            border-radius: 40px; 
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 20px 40px rgba(168, 85, 247, 0.15);
            transform: rotate(-5deg);
            transition: transform 0.3s;
        }
        .bus-logo:hover { transform: rotate(0deg) scale(1.05); }
        .subtitle { font-size: 1.1rem; color: #9ca3af; font-weight: 600; margin-bottom: 8px; }
        .greeting-box h1 { 
            font-size: 2.8rem; 
            color: #1f2937; 
            font-weight: 900; 
            letter-spacing: -1px; 
            background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
        }

        .menue-buttons { display: flex; flex-direction: column; gap: 16px; width: 100%; margin-bottom: 40px; }
        .menu-btn {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px 24px;
            border-radius: 24px;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            width: 100%;
            text-align: right;
            position: relative;
            overflow: hidden;
            text-decoration: none;
        }
        .menu-btn:active { transform: scale(0.98); }
        
        .btn-icon {
            width: 48px; 
            height: 48px; 
            border-radius: 16px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: rgba(255,255,255,0.2); 
            backdrop-filter: blur(5px);
        }
        
        .btn-text { display: flex; flex-direction: column; gap: 2px; }
        .btn-text span { font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
        .btn-text small { font-size: 0.9rem; opacity: 0.9; font-weight: 500; }

        .btn-green { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; box-shadow: 0 15px 30px rgba(34, 197, 94, 0.2); }
        .btn-purple { background: white; color: #7c3aed; border: 2px solid #7c3aed; box-shadow: 0 10px 20px rgba(124, 58, 237, 0.05); }
        .btn-purple .btn-icon { background: #f3f4f6; color: #7c3aed; }

        .features-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 40px; }
        .mini-card { 
            background: white; 
            padding: 15px 10px; 
            border-radius: 16px; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.03); 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 8px; 
            border: 1px solid #f3f4f6;
        }
        .mini-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .icon-purple { background: #f3e8ff; color: #9333ea; }
        .icon-orange { background: #ffedd5; color: #ea580c; }
        .icon-green { background: #dcfce7; color: #16a34a; }
        .mini-card span { font-size: 0.85rem; font-weight: 700; color: #4b5563; }

        .leaderboard-section { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .section-header h2 { font-size: 1.2rem; margin-bottom: 15px; text-align: right; color: #1f2937; margin-bottom: 20px; }
        .leaderboard-list { display: flex; flex-direction: column; gap: 12px; }
        .player-row { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
        .player-row:last-child { border-bottom: none; padding-bottom: 0; }
        .rank { font-weight: 800; color: #9ca3af; width: 25px; }
        .player-details { flex: 1; text-align: right; font-weight: 700; color: #374151; }
        .score-badge { background: #f3f4f6; padding: 4px 10px; border-radius: 8px; font-weight: 700; color: #7c3aed; font-size: 0.9rem; }
        .no-data { color: #9ca3af; font-size: 0.9rem; padding: 10px; }

        .home-footer { margin-top: auto; color: #9ca3af; font-size: 0.8rem; padding-top: 20px; }
      `}} />
    </div>
  );
};

export default Home;
