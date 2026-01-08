import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Users, Home as HomeIcon } from 'lucide-react';
import SEO from '../components/SEO';

const PlayModeSelection = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    return (
        <div className="mode-selection-page">
            <SEO title="اختر وضع اللعب" description="اختر بين اللعب الفردي أو الجماعي وابدأ التحدي الآن." />
            <div className="mode-selection-container">
                <button
                    onClick={() => navigate('/')}
                    className="back-btn"
                    style={{ position: 'absolute', top: '20px', right: '20px' }}
                >
                    <HomeIcon size={20} /> رجوع
                </button>

                <h1 className="mode-selection-title">اختر وضع اللعب</h1>
                <p className="mode-selection-subtitle">اختر بين اللعب الفردي أو التحدي الجماعي</p>

                <div className="mode-cards-grid">
                    {/* Solo Play Card */}
                    <div
                        className="mode-card solo-card"
                        onClick={() => navigate('/play/solo')}
                    >
                        <div className="mode-card-icon">
                            <Play size={48} />
                        </div>
                        <h2 className="mode-card-title">لعب فردي</h2>
                        <p className="mode-card-description">تحدى نفسك والوقت في جولة سريعة</p>
                        <ul className="mode-card-features">
                            <li>⚡ ابدأ فوراً</li>
                            <li>⏱️ 60 ثانية</li>
                            <li>🏆 احصل على نقاط</li>
                        </ul>
                    </div>

                    {/* Multiplayer Card */}
                    <div
                        className="mode-card multi-card"
                        onClick={() => navigate('/play/multiplayer')}
                    >
                        <div className="mode-card-icon">
                            <Users size={48} />
                        </div>
                        <h2 className="mode-card-title">لعب جماعي</h2>
                        <p className="mode-card-description">تحدى أصدقاءك وتنافس معهم</p>
                        <ul className="mode-card-features">
                            <li>👥 ألعب مع الأصدقاء</li>
                            <li>🎯 منافسة حقيقية</li>
                            <li>📊 نتائج مباشرة</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mode-selection-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    direction: rtl;
                }

                .mode-selection-container {
                    max-width: 900px;
                    width: 100%;
                    position: relative;
                }

                .back-btn {
                    background: white;
                    border: 2px solid #e5e7eb;
                    color: #6b7280;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }

                .mode-selection-title {
                    text-align: center;
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #1f2937;
                    margin-bottom: 10px;
                }

                .mode-selection-subtitle {
                    text-align: center;
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin-bottom: 50px;
                }

                .mode-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                }

                .mode-card {
                    background: white;
                    border-radius: 24px;
                    padding: 40px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 3px solid transparent;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    position: relative;
                    overflow: hidden;
                }

                .mode-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                    transform: scaleX(0);
                    transition: transform 0.3s;
                }

                .mode-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .mode-card:hover::before {
                    transform: scaleX(1);
                }

                .solo-card {
                    border-color: transparent;
                }

                .solo-card:hover {
                    border-color: #22c55e;
                }

                .solo-card .mode-card-icon {
                    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                    color: #16a34a;
                }

                .multi-card::before {
                    background: linear-gradient(90deg, #a855f7, #9333ea);
                }

                .multi-card:hover {
                    border-color: #a855f7;
                }

                .multi-card .mode-card-icon {
                    background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
                    color: #9333ea;
                }

                .mode-card-icon {
                    width: 100px;
                    height: 100px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }

                .mode-card-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin-bottom: 12px;
                    text-align: center;
                }

                .mode-card-description {
                    color: #6b7280;
                    font-size: 1rem;
                    text-align: center;
                    margin-bottom: 24px;
                }

                .mode-card-features {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .mode-card-features li {
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 12px;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #4b5563;
                    font-size: 0.95rem;
                }

                @media (max-width: 768px) {
                    .mode-selection-title {
                        font-size: 2rem;
                    }

                    .mode-cards-grid {
                        grid-template-columns: 1fr;
                    }

                    .mode-card {
                        padding: 30px;
                    }
                }
                `
            }} />
        </div>
    );
};

export default PlayModeSelection;
