import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Users, Zap, Play, User, Crown, Info, BookOpen, Download } from 'lucide-react';
import { Apple, Smartphone } from 'lucide-react'; // For app store icons
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

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
    <div className="home-container">
      <SEO
        title="الرئيسية"
        description="العب أوتوبيس كومبليت (ولد بنت نبات حيوان جماد) أونلاين مجاناً. تحدى أصدقاءك في اللعب الجماعي أو استمتع باللعب الفردي لتطوير مهاراتك اللغوية وسرعة بديهتك."
        keywords="أوتوبيس كومبليت, لعبة ولد بنت نبات حيوان أونلاين, ألعاب كلمات عربية, مسابقات حروف, لعبة الأتوبيس مجانا, تحدي الأصدقاء كلمات, لعبة ذكاء عربية"
      />
      <div className="home-content-wrapper">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="banner-text">
            <h1>أهلاً بك، {token ? 'يا بطل' : 'زائر'}! 👋</h1>
            <p>جاهز للتحدي اليوم؟</p>
          </div>
          <div className="banner-icon">🚀</div>
        </div>

        {/* Main Actions Grid */}
        <div className="actions-grid">
          <Link to="/play/solo" className="action-card card-green">
            <div className="card-icon"><Play size={32} /></div>
            <div className="card-info">
              <h3>لعب فردي</h3>
              <p>تحدى نفسك والوقت</p>
            </div>
            <div className="card-arrow"><Sparkles size={16} /></div>
          </Link>

          <Link to="/play/multiplayer" className="action-card card-purple">
            <div className="card-icon"><Users size={32} /></div>
            <div className="card-info">
              <h3>لعب جماعي</h3>
              <p>تحدى أصدقاءك</p>
            </div>
            <div className="card-arrow"><Zap size={16} /></div>
          </Link>

          {!token && (
            <Link to="/register" className="action-card card-orange">
              <div className="card-icon"><User size={32} /></div>
              <div className="card-info">
                <h3>تسجيل حساب</h3>
                <p>احفظ نقاطك</p>
              </div>
              <div className="card-arrow"><Crown size={16} /></div>
            </Link>
          )}
        </div>

        {/* Features Row */}
        <div className="features-row">
          <div className="feature-item">
            <span className="feat-icon">⚡</span>
            <span>سرعة بديهة</span>
          </div>
          <div className="feature-item">
            <span className="feat-icon">🧠</span>
            <span>تفكير استراتيجي</span>
          </div>
          <div className="feature-item">
            <span className="feat-icon">🏆</span>
            <span>تصدر القائمة</span>
          </div>
        </div>

        {/* About the Game Section */}
        <section className="about-section">
          <div className="section-title">
            <Info className="text-purple-500" />
            <h2>عن أوتوبيس كومبليت</h2>
          </div>
          <p>
            لعبة "أوتوبيس كومبليت" هي النسخة الرقمية الحديثة من لعبة الكلمات الشهيرة "ولد بنت نبات حيوان جماد".
            صممنا هذه اللعبة لتجمع بين المتعة الكلاسيكية والتقنية الحديثة، حيث يمكنك اللعب بمفردك لتطوير مهاراتك
            أو تحدي أصدقائك في غرف لعب مباشرة.
          </p>
        </section>

        {/* Quick Help Section */}
        <section className="how-it-works">
          <div className="section-title">
            <BookOpen className="text-green-500" />
            <h2>كيف تبدأ؟</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-num">1</span>
              <h4>اختر الحرف</h4>
              <p>يتم اختيار حرف عشوائي لبدء الجولة</p>
            </div>
            <div className="step-card">
              <span className="step-num">2</span>
              <h4>املأ الفئات</h4>
              <p>اكتب كلمات تبدأ بالحرف في أسرع وقت</p>
            </div>
            <div className="step-card">
              <span className="step-num">3</span>
              <h4>اجمع النقاط</h4>
              <p>كلما كنت أسرع وأكثر دقة، زادت نقاطك</p>
            </div>
          </div>
          <Link to="/how-to-play" className="read-more-link">اقرأ القواعد كاملة →</Link>
        </section>

        {/* Download App Section */}
        <section className="download-section">
          <div className="download-card">
            <div className="download-info">
              <h3>حمل التطبيق الآن! 📱</h3>
              <p>استمتع بتجربة لعب أفضل وأسرع عبر تطبيقاتنا للهواتف الذكية.</p>
            </div>
            <div className="app-buttons">
              <a href="#" className="app-btn ios">
                <Apple size={24} />
                <div className="btn-txt">
                  <span>Available on the</span>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href="#" className="app-btn android">
                <Smartphone size={24} />
                <div className="btn-txt">
                  <span>Get it on</span>
                  <strong>Google Play</strong>
                </div>
              </a>
            </div>
          </div>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-container {
            padding: 10px;
            direction: rtl;
            width: 100%;
        }

        .home-content-wrapper {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .welcome-banner {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border-radius: 24px;
            padding: 30px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .banner-text h1 { margin: 0; font-size: 2rem; }
        .banner-text p { margin: 5px 0 0; opacity: 0.8; font-size: 1.1rem; }
        .banner-icon { font-size: 3rem; }

        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
        }

        .action-card {
            background: white;
            border-radius: 20px;
            padding: 24px;
            display: flex;
            align-items: center;
            gap: 20px;
            text-decoration: none;
            color: #1f2937;
            transition: all 0.2s;
            border: 2px solid transparent;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            position: relative;
            overflow: hidden;
        }
        .action-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }

        .card-green:hover { border-color: #22c55e; }
        .card-green .card-icon { background: #dcfce7; color: #16a34a; }
        
        .card-purple:hover { border-color: #a855f7; }
        .card-purple .card-icon { background: #f3e8ff; color: #9333ea; }

        .card-orange:hover { border-color: #f97316; }
        .card-orange .card-icon { background: #ffedd5; color: #ea580c; }

        .card-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: transform 0.2s; }
        .action-card:hover .card-icon { transform: scale(1.1); }

        .card-info h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
        .card-info p { margin: 4px 0 0; color: #6b7280; font-size: 0.9rem; }

        .card-arrow { margin-right: auto; color: #d1d5db; }

        .features-row { display: flex; justify-content: space-around; padding: 20px; background: white; border-radius: 20px; border: 1px solid #f3f4f6; }
        .feature-item { display: flex; flex-direction: column; align-items: center; gap: 8px; font-weight: 700; color: #4b5563; }
        .feat-icon { font-size: 1.5rem; }

        .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .section-title h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1f2937; }

        .about-section p { line-height: 1.8; color: #4b5563; font-size: 1.1rem; background: white; padding: 25px; border-radius: 20px; border: 1px solid #f3f4f6; }

        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 10px; }
        .step-card { background: white; padding: 20px; border-radius: 20px; border: 1px solid #f3f4f6; text-align: center; }
        .step-num { width: 30px; height: 30px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: 800; color: #6b7280; }
        .step-card h4 { margin: 0 0 10px; color: #1f2937; }
        .step-card p { margin: 0; font-size: 0.9rem; color: #6b7280; }
        .read-more-link { display: inline-block; margin-top: 15px; color: #7c3aed; font-weight: 700; text-decoration: none; }

        .download-section { margin-top: 20px; margin-bottom: 20px; }
        .download-card { 
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); 
            padding: 24px 30px; 
            border-radius: 20px; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 20px; 
        }
        .download-info { text-align: right; }
        .download-info h3 { font-size: 1.4rem; margin: 0; font-weight: 800; }
        .download-info p { margin: 5px 0 0; opacity: 0.9; font-size: 0.95rem; max-width: 400px; }
        
        .app-buttons { display: flex; gap: 10px; }
        .app-btn { 
            background: rgba(0,0,0,0.3); 
            color: white; 
            padding: 6px 14px; 
            border-radius: 10px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            text-decoration: none; 
            transition: all 0.2s; 
            min-width: 130px; 
            border: 1px solid rgba(255,255,255,0.1);
        }
        .app-btn:hover { background: rgba(0,0,0,0.5); transform: translateY(-2px); }
        .btn-txt { display: flex; flex-direction: column; line-height: 1.2; }
        .btn-txt span { font-size: 0.6rem; opacity: 0.8; }
        .btn-txt strong { font-size: 0.9rem; }

        @media (max-width: 768px) {
            .download-card { flex-direction: column; text-align: center; padding: 20px; }
            .download-info { text-align: center; }
            .app-buttons { justify-content: center; width: 100%; }
            .actions-grid { grid-template-columns: 1fr; }
            .welcome-banner { flex-direction: column; text-align: center; gap: 20px; }
            .banner-text h1 { font-size: 1.5rem; }
        }
      `}} />
    </div>
  );
};

export default Home;
