import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Timer, Send, LogOut, CheckCircle, XCircle, Home as HomeIcon, Play } from 'lucide-react';
import SEO from '../components/SEO';

// Results View Component
const ResultsView = ({ results, onReset, onRestart }) => {
    return (
        <div className="max-w-4xl mx-auto pt-6 px-4 pb-20">
            {/* Main Score Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 text-center mb-10 relative overflow-hidden border border-purple-50">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"></div>

                <div className="relative z-10">
                    <div className="w-40 h-40 bg-gradient-to-br from-purple-50 to-white rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-inner border-2 border-purple-100">
                        <span className="text-xs text-purple-400 font-extrabold uppercase tracking-widest mb-1">النقاط</span>
                        <span className="text-6xl font-black text-purple-600 drop-shadow-sm">{results.totalScore}</span>
                    </div>

                    <h3 className="text-3xl font-black text-gray-800 mb-3">أداء رائع! 🎊</h3>
                    <p className="text-gray-500 font-medium">لقد أكملت جولة مميزة، إليك تفاصيل نتائجك:</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-50 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-50 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* Compact Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                {Object.entries(results.details).map(([cat, res], index) => (
                    <div
                        key={cat}
                        className={`bg-white p-5 rounded-2xl shadow-sm border-2 transition-all hover:scale-105 hover:shadow-md ${res.isCorrect ? 'border-green-100' : 'border-red-50'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-md">{cat}</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${res.isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                                {res.isCorrect ? <CheckCircle size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                            </div>
                        </div>

                        <div className="mt-2">
                            <h4 className={`font-black text-xl truncate ${res.isCorrect ? 'text-gray-800' : 'text-gray-300'}`}>
                                {res.word || '---'}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                                <span className={`text-sm font-black ${res.isCorrect ? 'text-green-600' : 'text-red-400'}`}>
                                    {res.isCorrect ? `+${res.score}` : '0'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold">نقاط</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-black transition-all"
                >
                    <HomeIcon size={20} />
                    <span>الرئيسية</span>
                </button>
                <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-purple-200 transition-all hover:-translate-y-1"
                >
                    <Play size={20} />
                    <span>لعب مجدداً</span>
                </button>
            </div>
        </div>
    );
};

// Main Solo Play Component
const SoloPlay = () => {
    const { token } = useAuth();
    const {
        isPlaying,
        isValidating,
        currentLetter,
        timeLeft,
        answers,
        results,
        startGame,
        updateAnswer,
        finishGame,
        resetGame,
        categories
    } = useGame();
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Auto-start game on mount
    useEffect(() => {
        if (token && !isPlaying && !results && !isValidating) {
            startGame();
        }
    }, [token, isPlaying, results, isValidating, startGame]);

    // Handle reset - go back to home
    const handleReset = () => {
        resetGame();
        navigate('/');
    };

    // Loading state
    if (isValidating) {
        return (
            <div className="game-loading container section-padding">
                <div className="loading-spinner"></div>
                <h2>جاري التحقق من الإجابات...</h2>
            </div>
        );
    }

    // Results state
    if (results) {
        return <ResultsView results={results} onReset={handleReset} onRestart={startGame} />;
    }

    // Playing state
    if (isPlaying) {
        return (
            <div className="game-play container">
                <SEO title={`لعب فردي - حرف ${currentLetter}`} description={`تحدى نفسك بحرف الـ ${currentLetter} في أوتوبيس كومبليت.`} />
                {/* Header */}
                <div className="game-header">
                    <div className="letter-box">
                        <span>الحرف:</span>
                        <h2>{currentLetter}</h2>
                    </div>
                    <div className={`timer-box ${timeLeft < 10 ? 'timer-danger' : ''}`}>
                        <Timer size={24} />
                        <h2>{timeLeft}</h2>
                    </div>

                    <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginRight: 'auto' }}>
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat} className="category-card">
                            <label>{cat}</label>
                            <input
                                type="text"
                                value={answers[cat] || ''}
                                onChange={(e) => updateAnswer(cat, e.target.value)}
                                autoFocus={cat === categories[0]}
                                placeholder="..."
                                autoComplete="off"
                            />
                        </div>
                    ))}
                </div>

                {/* Bottom Action Button */}
                <div className="mt-8 mb-20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <button
                        onClick={finishGame}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-black py-5 rounded-2xl shadow-lg shadow-purple-200 transform transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Send size={24} />
                        <span>إنهاء وإرسال الإجابات</span>
                    </button>
                </div>
            </div>
        );
    }

    // Loading/initial state
    return (
        <div className="text-center p-10">
            <h2 className="mb-4">جاري تحضير اللعبة...</h2>
        </div>
    );
};

export default SoloPlay;
