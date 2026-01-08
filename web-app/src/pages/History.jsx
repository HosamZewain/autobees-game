
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import SEO from '../components/SEO';

const History = () => {
    const { token, API_URL } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_URL}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchHistory();
    }, [token, API_URL]);

    if (!token) return null;

    return (
        <div className="history-page container">
            <SEO title="سجل الألعاب" description="استعرض تاريخ ألعابك، نتائجك، وإحصائيات فوزك في أوتوبيس كومبليت." />
            <div className="history-header">
                <button onClick={() => navigate('/play')} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>سجل الألعاب</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>جاري تحميل السجل...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="empty-state">
                    <Clock size={64} />
                    <h3>لا يوجد سجل ألعاب بعد</h3>
                    <p>ابدأ اللعب الآن لتسجيل انتصاراتك!</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((match) => (
                        <div key={match.id} className={`history-card ${match.is_winner ? 'win-card' : ''}`}>
                            <div className="match-info">
                                <div className="match-date">
                                    <Calendar size={14} />
                                    <span>{new Date(match.played_at).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <div className="match-id">
                                    {match.room_id === 'solo' ? 'لعب فردي' : `غرفة #${match.room_id}`}
                                </div>
                            </div>

                            <div className="match-result">
                                <div className="score-display">
                                    <span className="score-label">النقاط</span>
                                    <span className="score-value">{match.score}</span>
                                </div>
                                <div className={`status-badge ${match.is_winner ? 'status-win' : 'status-loss'}`}>
                                    {match.is_winner ? (
                                        <><CheckCircle size={16} /> فوز</>
                                    ) : (
                                        <><XCircle size={16} /> {match.room_id === 'solo' ? 'تم' : 'خسارة'}</>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: historyStyles }} />
        </div>
    );
};

const historyStyles = `
    .history-page { 
        max-width: 600px; 
        margin: 0 auto; 
        padding: 30px 20px; 
        direction: rtl; 
        min-height: 85vh;
    }
    
    .history-header { 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        margin-bottom: 30px; 
    }
    .back-btn { 
        background: white; 
        border: 1px solid #e5e7eb; 
        width: 44px; 
        height: 44px; 
        border-radius: 14px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        cursor: pointer; 
        color: #374151; 
        transition: all 0.2s;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
    }
    .back-btn:active { transform: scale(0.95); }
    .history-header h1 { font-size: 1.8rem; margin: 0; color: #1f2937; font-weight: 800; }
    
    .loading-state, .empty-state {
        text-align: center;
        padding: 80px 20px;
        color: #6b7280;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        background: white;
        border-radius: 30px;
        border: 1px solid #f3f4f6;
    }
    .spinner { 
        border: 4px solid #f3f3f3; 
        border-top: 4px solid #a855f7; 
        border-radius: 50%; 
        width: 40px; 
        height: 40px; 
        animation: spin 1s linear infinite; 
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .history-list { display: flex; flex-direction: column; gap: 15px; }
    .history-card {
        padding: 20px 24px;
        border-radius: 20px;
        background: white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid #f3f4f6;
        transition: transform 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .history-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .win-card { border-right: 5px solid #10b981; }

    .match-info { display: flex; flex-direction: column; gap: 6px; }
    .match-date { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #9ca3af; font-weight: 600; }
    .match-id { font-weight: 800; color: #374151; font-size: 1.05rem; }

    .match-result { display: flex; align-items: center; gap: 20px; text-align: left; }
    .score-display { display: flex; flex-direction: column; align-items: flex-end; }
    .score-label { font-size: 0.75rem; color: #9ca3af; font-weight: 700; }
    .score-value { font-size: 1.5rem; font-weight: 900; color: #7c3aed; line-height: 1; }

    .status-badge { 
        display: flex; 
        align-items: center; 
        gap: 6px; 
        padding: 8px 14px; 
        border-radius: 14px; 
        font-size: 0.9rem; 
        font-weight: 700; 
    }
    .status-win { background: #d1fae5; color: #059669; }
    .status-loss { background: #f3f4f6; color: #6b7280; }
`;

export default History;
