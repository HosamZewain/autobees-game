import React from 'react';
import { ArrowLeft, Sparkles, Users, Zap, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();
    return (
        <div className="about-page container">
            <div className="about-header">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>عن أوتوبيس كومبليت</h1>
            </div>

            <div className="about-card">
                <div className="bus-logo-mini">🚌</div>
                <p className="intro-text">
                    <strong>أوتوبيس كومبليت</strong> هي منصة الألعاب العربية الرائدة التي تعيد إحياء ذكريات الطفولة الكلاسيكية بلمسة تكنولوجية عصرية وممتعة.
                </p>

                <div className="divider"></div>

                <div className="features-list">
                    <div className="feature-item">
                        <div className="f-icon purple"><Zap size={20} /></div>
                        <div className="f-content">
                            <h3>سرعة وبديهة</h3>
                            <p>اختبر معلوماتك العامة وسرعة استحضار الكلمات.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="f-icon orange"><Users size={20} /></div>
                        <div className="f-content">
                            <h3>تحدي الأصدقاء</h3>
                            <p>نافس لاعبين من جميع أنحاء العالم في الوقت الفعلي.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="f-icon green"><BookOpen size={20} /></div>
                        <div className="f-content">
                            <h3>ذكاء لغوي</h3>
                            <p>نظام متطور للتحقق من الكلمات العربية بدقة عالية.</p>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="footer-msg">
                    <p>صُنعت بكل 💜 لأجلكم</p>
                    <small>الإصدار 2.0</small>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .about-page {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px 20px;
            direction: rtl;
        }
        .about-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;
        }
        .back-btn {
            background: white;
            border: 1px solid #e5e7eb;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #374151;
            transition: all 0.2s;
        }
        .back-btn:hover { background: #f3f4f6; color: #000; }
        .about-header h1 { font-size: 1.5rem; color: #1f2937; margin: 0; font-weight: 800; }

        .about-card {
            background: white;
            padding: 40px 30px;
            border-radius: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.05);
            text-align: center;
            border: 1px solid #f3f4f6;
        }
        
        .bus-logo-mini {
            font-size: 60px;
            margin-bottom: 20px;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
            display: inline-block;
            animation: bounce 2s infinite;
        }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }

        .intro-text {
            font-size: 1.1rem;
            color: #4b5563;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        .intro-text strong { color: #7c3aed; }

        .divider { height: 1px; background: #f3f4f6; margin: 30px 0; }

        .features-list { display: flex; flex-direction: column; gap: 20px; text-align: right; }
        .feature-item { display: flex; align-items: flex-start; gap: 15px; }
        .f-icon {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .purple { background: #f3e8ff; color: #9333ea; }
        .orange { background: #ffedd5; color: #ea580c; }
        .green { background: #dcfce7; color: #16a34a; }
        
        .f-content h3 { font-size: 1.1rem; margin: 0 0 5px; color: #1f2937; font-weight: 700; }
        .f-content p { margin: 0; color: #6b7280; font-size: 0.95rem; line-height: 1.5; }

        .footer-msg { color: #9ca3af; }
        .footer-msg p { margin: 0 0 5px; font-weight: 600; }
        .footer-msg small { opacity: 0.7; }
                `
            }} />
        </div>
    );
};

export default About;
