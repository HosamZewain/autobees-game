import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
    Timer, Send, Play, RotateCcw, Home as HomeIcon, CheckCircle, XCircle,
    Users, User, Plus, AlertCircle, ArrowRight, Trophy, Settings, HelpCircle
} from 'lucide-react';

const PlayPage = () => {
    const { user, token } = useAuth();
    const {
        isPlaying: isSoloPlaying, isValidating, currentLetter: soloLetter, timeLeft: soloTime, answers: soloAnswers, results: soloResults,
        startGame: startSoloGame, updateAnswer: updateSoloAnswer, finishGame: finishSoloGame, resetGame: resetSoloGame, categories
    } = useGame();

    const {
        socket, rooms, currentRoom, onlinePlayers, roundResults, createRoom, joinRoom, leaveRoom, startGame: startMultiGame, submitAnswers: submitMultiAnswers, nextRound
    } = useSocket();

    // Modes: 'home', 'solo', 'lobby-selection', 'lobby', 'multi-playing', 'multi-results'
    const [mode, setMode] = useState('home');
    const [newRoomName, setNewRoomName] = useState('');

    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!token) navigate('/login');
    }, [token, navigate]);

    // Back to home if currentRoom is left
    useEffect(() => {
        if (!currentRoom && mode === 'lobby') {
            setMode('home');
        }
    }, [currentRoom, mode]);


    // --- VIEWS ---

    // 1. Loading
    if (isValidating) {
        return (
            <div className="game-loading container section-padding">
                <div className="loading-spinner"></div>
                <h2>جاري التحقق من الإجابات...</h2>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .game-loading { text-align: center; padding: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
                    .loading-spinner { border: 4px solid #f3f3f3; border-top: 4px solid #a855f7; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .game-loading h2 { color: #4b5563; font-size: 1.2rem; }
                `}} />
            </div>
        );
    }

    // 2. Solo Results
    if (soloResults) {
        return <ResultsView results={soloResults} onReset={() => { resetSoloGame(); setMode('home'); }} onRestart={startSoloGame} />;
    }

    // 3. Solo Game
    if (isSoloPlaying && mode === 'solo') {
        return (
            <div className="game-play container section-padding">
                <div className="game-header card">
                    <div className="letter-box">
                        <span>الحرف:</span>
                        <h2>{soloLetter}</h2>
                    </div>
                    <div className={`timer-box ${soloTime < 10 ? 'timer-danger' : ''}`}>
                        <Timer size={24} />
                        <h2>{soloTime} ثانية</h2>
                    </div>
                    <button onClick={finishSoloGame} className="btn btn-primary">
                        <Send size={20} />
                        إنهاء
                    </button>
                </div>

                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat} className="category-card card">
                            <label>{cat}</label>
                            <input
                                type="text"
                                placeholder={`كلمة تبدأ بـ ${soloLetter}...`}
                                value={soloAnswers[cat] || ''}
                                onChange={(e) => updateSoloAnswer(cat, e.target.value)}
                                autoFocus={cat === categories[0]}
                            />
                        </div>
                    ))}
                </div>
                <style dangerouslySetInnerHTML={{ __html: gameStyles }} />
            </div>
        );
    }

    // 4. Multiplayer Views
    if (currentRoom) {
        // Robust Host Check
        const isHost = (currentRoom.ownerUserId && currentRoom.ownerUserId == user.id) ||
            (currentRoom.players && currentRoom.players[0] && currentRoom.players[0].userId == user.id);

        const isMultiPlaying = currentRoom.status === 'playing';
        const isFinished = currentRoom.status === 'finished';

        // A. Playing
        if (isMultiPlaying) {
            const roomCategories = currentRoom.config?.categories || categories;
            return (
                <div className="game-play container section-padding">
                    <div className="game-header card">
                        <div className="letter-box">
                            <span>الجولة: {currentRoom.round} - الحرف:</span>
                            <h2>{currentRoom.letter}</h2>
                        </div>
                        <div className={`timer-box ${currentRoom.timeLeft < 10 ? 'timer-danger' : ''}`}>
                            <Timer size={24} />
                            <h2>{currentRoom.timeLeft} ثانية</h2>
                        </div>
                        <button onClick={() => submitMultiAnswers(soloAnswers)} className="btn btn-primary">
                            <Send size={20} />
                            إرسال
                        </button>
                    </div>

                    <div className="categories-grid">
                        {roomCategories.map((cat) => (
                            <div key={cat} className="category-card card">
                                <label>{cat}</label>
                                <input
                                    type="text"
                                    placeholder={`كلمة تبدأ بـ ${currentRoom.letter}...`}
                                    value={soloAnswers[cat] || ''}
                                    onChange={(e) => updateSoloAnswer(cat, e.target.value)}
                                    autoFocus={cat === roomCategories[0]}
                                />
                            </div>
                        ))}
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: gameStyles }} />
                </div>
            );
        }

        // B. Round Results
        if (roundResults) {
            return (
                <div className="multi-results container section-padding">
                    <div className="results-header card">
                        <h1>نتائج الجولة {roundResults.round}</h1>
                        <p>الحرف: {roundResults.letter}</p>
                    </div>

                    <div className="players-results-grid">
                        {roundResults.players.map(player => {
                            const playerResult = roundResults.results[player.id || player.socketId] || { categories: {}, total: 0 };
                            return (
                                <div key={player.id} className={`player-result-card card ${player.id === socket?.id ? 'active-player' : ''}`}>
                                    <div className="player-summary">
                                        <div className="player-identity">
                                            <span className="avatar">👤</span>
                                            <span className="name">{player.name || player.username}</span>
                                        </div>
                                        <div className="round-score">
                                            +{playerResult.total || 0}
                                        </div>
                                    </div>
                                    <div className="words-list">
                                        {Object.entries(playerResult.categories || {}).map(([cat, info]) => (
                                            <div key={cat} className={`word-item ${info.type || 'wrong'}`}>
                                                <span className="word-cat">{cat}</span>
                                                <span className="word-text">{info.value || '-'}</span>
                                                <span className="word-points">
                                                    {info.type === 'green' && <CheckCircle size={14} />}
                                                    {info.type === 'yellow' && <AlertCircle size={14} />}
                                                    {info.type === 'red' && <XCircle size={14} />}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="total-score-badge">
                                        المجموع: {player.score}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="results-actions">
                        <button onClick={leaveRoom} className="btn btn-outline">مغادرة</button>
                        {isHost ? (
                            <div className="host-controls">
                                <button onClick={nextRound} className="btn btn-primary btn-lg">
                                    الجولة التالية <ArrowRight size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="waiting-msg">في انتظار المضيف لبدء الجولة التالية...</div>
                        )}
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: resultsStyles }} />
                    <style dangerouslySetInnerHTML={{ __html: multiStyles }} />
                </div>
            );
        }

        // C. Final Results
        if (isFinished) {
            const players = currentRoom.players || [];
            // Sort by score descending
            const sorted = [...players].sort((a, b) => b.score - a.score);
            const winner = sorted[0];

            return (
                <div className="multi-results container section-padding">
                    <div className="results-header card">
                        <div className="total-score">
                            <p>الفائز 👑</p>
                            <h1>{winner?.username}</h1>
                        </div>
                        <div className="results-message">
                            <h3>انتهت اللعبة! 🏁</h3>
                            <p>إليك الترتيب النهائي</p>
                        </div>
                    </div>

                    <div className="scores-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>الترتيب</th>
                                    <th>اللاعب</th>
                                    <th>مجموع النقاط</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((p, i) => (
                                    <tr key={p.id} className={p.id === user.id ? 'current-player' : ''}>
                                        <td>#{i + 1}</td>
                                        <td>{p.username} {i === 0 && '🏆'}</td>
                                        <td>{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="results-actions">
                        <button onClick={leaveRoom} className="btn btn-outline">
                            <HomeIcon size={20} /> الخروج
                        </button>
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: resultsStyles }} />
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .scores-table { width: 100%; margin-bottom: 30px; background: white; border-radius: 16px; padding: 0; overflow: hidden; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #f9fafb; padding: 15px; text-align: right; font-weight: 700; color: #6b7280; font-size: 0.9rem; }
                        td { padding: 15px; border-top: 1px solid #f3f4f6; font-weight: 600; color: #1f2937; }
                        .current-player { background: #f5f3ff; }
                        .current-player td { color: #7c3aed; font-weight: 800; }
                    `}} />
                </div>
            );
        }

        // D. Lobby
        return (
            <div className="lobby container section-padding">
                <div className="card lobby-card">
                    <div className="lobby-header">
                        <h1>غرفة الانتظار: {currentRoom.name}</h1>
                        <div className="room-id">معرف الغرفة: {currentRoom.id}</div>
                    </div>

                    <div className="players-list">
                        <h3>اللاعبين ({currentRoom.players.length}/{currentRoom.maxPlayers})</h3>
                        <div className="players-grid">
                            {currentRoom.players.map(p => (
                                <div key={p.id} className="player-tag">
                                    <span className="player-avatar">👤</span>
                                    <span className="player-name">
                                        {p.username} {p.id === user.id && '(أنت)'}
                                        {((currentRoom.ownerUserId && p.userId == currentRoom.ownerUserId) || currentRoom.players[0].id === p.id) && ' 👑'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lobby-actions">
                        <button onClick={leaveRoom} className="btn btn-outline">مغادرة</button>
                        {isHost ? (
                            <button onClick={startMultiGame} className="btn btn-primary btn-lg" disabled={currentRoom.players.length < 1}>
                                <Play size={20} /> ابدأ اللعبة
                            </button>
                        ) : (
                            <div className="waiting-msg">في انتظار المضيف لبدء اللعبة...</div>
                        )}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: lobbyStyles }} />
            </div>
        );
    }

    // 5. Multiplayer Selection (Rooms List)
    if (mode === 'lobby-selection') {
        return (
            <div className="mode-selection container section-padding">
                <div className="multi-header">
                    <button className="btn btn-outline" onClick={() => setMode('home')}>رجوع</button>
                    <h2>لعب جماعي</h2>
                </div>

                <div className="multi-actions card">
                    <div className="create-room">
                        <input
                            type="text"
                            placeholder="اسم الغرفة الجديدة..."
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                        />
                        <button onClick={() => { if (newRoomName) createRoom(newRoomName); }} className="btn btn-primary">
                            <Plus size={18} /> إنشاء
                        </button>
                    </div>

                    <div className="rooms-list-container">
                        <h3>الغرف المتاحة ({onlinePlayers} متصل)</h3>
                        {rooms.length === 0 ? (
                            <div className="no-rooms">
                                <p>لا توجد غرف متاحة حالياً.</p>
                                <small>أنشئ غرفة وادعُ أصدقاءك!</small>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {rooms.map(room => (
                                    <div key={room.id} className="room-item">
                                        <div className="room-info">
                                            <strong>{room.name}</strong>
                                            <span>{room.players}/{room.maxPlayers} لاعبين</span>
                                        </div>
                                        <button
                                            onClick={() => joinRoom(room.id)}
                                            className="btn btn-outline btn-sm"
                                            disabled={room.status !== 'lobby' || room.players >= room.maxPlayers}
                                        >
                                            انضمام
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: multiSelectionStyles }} />
            </div>
        )
    }

    // 6. Home View (Mobile UX Match)
    return (
        <div className="mobile-home container">
            <div className="greeting-box">
                <div className="bus-logo">
                    <span style={{ fontSize: '80px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🚌</span>
                </div>
                <h3>مساء الخير، {user?.username}</h3>
                <h1>أوتوبيس كومبليت</h1>
            </div>

            <div className="menue-buttons">
                <button
                    className="menu-btn btn-green"
                    onClick={() => { setMode('solo'); startSoloGame(); }}
                >
                    <div className="btn-icon"><Play size={24} fill="currentColor" /></div>
                    <div className="btn-text">
                        <span>لعب فردي</span>
                        <small>تحدى نفسك</small>
                    </div>
                </button>

                <button
                    className="menu-btn btn-purple"
                    onClick={() => setMode('lobby-selection')}
                >
                    <div className="btn-icon"><Users size={24} fill="currentColor" /></div>
                    <div className="btn-text">
                        <span>لعب جماعي</span>
                        <small>تحدى أصدقاءك</small>
                    </div>
                </button>

                <button
                    className="menu-btn btn-orange"
                    onClick={() => navigate('/history')}
                >
                    <div className="btn-icon"><Trophy size={24} fill="currentColor" /></div>
                    <div className="btn-text">
                        <span>سجل الألعاب</span>
                        <small>انتصاراتك السابقة</small>
                    </div>
                </button>

                <button
                    className="menu-btn btn-white"
                    onClick={() => navigate('/profile')}
                >
                    <div className="btn-icon"><Settings size={24} /></div>
                    <div className="btn-text">
                        <span>الإعدادات</span>
                        <small>تعديل الملف</small>
                    </div>
                </button>
            </div>

            <div className="home-footer">
                <button className="help-link">
                    <HelpCircle size={18} />
                    <span>شرح طريقة اللعب</span>
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: mobileHomeStyles }} />
        </div>
    );
};

// --- STYLES ---

const ResultsView = ({ results, onReset, onRestart }) => {
    return (
        <div className="results-page container section-padding">
            <div className="results-header card">
                <div className="total-score">
                    <p>مجموع النقاط</p>
                    <h1>{results.totalScore}</h1>
                </div>
                <div className="results-message">
                    <h3>أحسنت صنعاً! ✨</h3>
                    <p>استمر في المحاولة لتحقيق رقم قياسي جديد.</p>
                </div>
            </div>

            <div className="results-list">
                {Object.entries(results.details).map(([cat, res]) => (
                    <div key={cat} className={`result-card card ${res.isCorrect ? 'res-correct' : 'res-wrong'}`}>
                        <div className="res-icon">
                            {res.isCorrect ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />}
                        </div>
                        <div className="res-info">
                            <label>{cat}</label>
                            <h3>{res.word || '---'}</h3>
                        </div>
                        <div className="res-points">
                            {res.score}+
                        </div>
                    </div>
                ))}
            </div>

            <div className="results-actions">
                <button onClick={onReset} className="btn btn-outline">
                    <HomeIcon size={20} />
                    الرئيسية
                </button>
                <button onClick={onRestart} className="btn btn-primary">
                    <RotateCcw size={20} />
                    لعب مجدداً
                </button>
            </div>
            <style dangerouslySetInnerHTML={{ __html: resultsStyles }} />
        </div>
    );
};


const mobileHomeStyles = `
    .mobile-home {
        max-width: 480px;
        margin: 0 auto;
        padding: 40px 24px;
        text-align: center;
        direction: rtl;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: radial-gradient(circle at top, #fdf4ff 0%, #ffffff 100%);
    }
    .greeting-box { margin-bottom: 50px; position: relative; }
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
    .greeting-box h3 { font-size: 1.1rem; color: #9ca3af; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.5px; }
    .greeting-box h1 { font-size: 2.8rem; color: #1f2937; font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .menue-buttons { display: flex; flex-direction: column; gap: 16px; width: 100%; }
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
    .btn-text span { font-size: 1.3rem; font-weight: 800; line-height: 1.2; }
    .btn-text small { font-size: 0.85rem; opacity: 0.9; font-weight: 500; }

    .btn-green { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; box-shadow: 0 15px 30px rgba(34, 197, 94, 0.2); }
    .btn-purple { background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%); color: white; box-shadow: 0 15px 30px rgba(147, 51, 234, 0.2); }
    .btn-orange { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); color: white; box-shadow: 0 15px 30px rgba(217, 119, 6, 0.2); }
    .btn-white { background: white; color: #374151; border: 2px solid #f3f4f6; box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
    .btn-white .btn-icon { background: #f3f4f6; color: #6b7280; }

    .home-footer { margin-top: auto; padding-top: 40px; opacity: 0.6; }
    .help-link { background: none; border: none; display: flex; align-items: center; gap: 8px; margin: 0 auto; cursor: pointer; color: #9ca3af; font-size: 0.95rem; font-weight: 600; padding: 10px; border-radius: 10px; transition: background 0.2s; }
    .help-link:hover { background: #f3f4f6; color: #6b7280; }
`;

const multiSelectionStyles = `
    .mode-selection { direction: rtl; max-width: 600px; margin: 0 auto; min-height: 90vh; }
    .multi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .multi-header h2 { font-size: 2rem; font-weight: 800; color: #1f2937; }
    
    .multi-actions { padding: 40px; border-radius: 32px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
    .create-room { display: flex; gap: 12px; margin-bottom: 40px; }
    .create-room input { 
        flex: 1; 
        padding: 16px 20px; 
        border: 2px solid #f3f4f6; 
        border-radius: 16px; 
        outline: none; 
        font-size: 1.1rem;
        background: #f9fafb;
        transition: all 0.2s;
    }
    .create-room input:focus { border-color: #a855f7; background: white; }
    .create-room button { padding: 0 25px; border-radius: 16px; font-weight: 700; }
    
    .rooms-list-container { text-align: right; }
    .rooms-list-container h3 { margin-bottom: 20px; font-size: 1.2rem; font-weight: 700; display: flex; justify-content: space-between; color: #4b5563; }
    .rooms-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .room-item { 
        background: white; 
        padding: 20px; 
        border-radius: 20px; 
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        border: 2px solid #f3f4f6; 
        transition: transform 0.2s;
    }
    .room-item:hover { transform: translateX(-5px); border-color: #a855f7; }
    .room-info { display: flex; flex-direction: column; gap: 4px; }
    .room-info strong { font-size: 1.1rem; color: #1f2937; }
    .room-info span { font-size: 0.9rem; color: #9ca3af; }
    .no-rooms { 
        text-align: center; 
        padding: 50px 20px; 
        background: #f9fafb; 
        border-radius: 24px; 
        border: 2px dashed #e5e7eb; 
        color: #9ca3af; 
    }
`;

const lobbyStyles = `
    .lobby { direction: rtl; text-align: center; display: flex; align-items: center; min-height: 80vh; }
    .lobby-card { max-width: 600px; margin: 0 auto; padding: 50px 40px; border-radius: 40px; background: white; box-shadow: 0 20px 60px rgba(0,0,0,0.08); width: 100%; }
    .lobby-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 15px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .room-id { color: #6b7280; font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; background: #f3f4f6; display: inline-block; padding: 8px 20px; border-radius: 12px; border: 2px solid #e5e7eb; font-weight: 600; }
    
    .players-list { margin: 50px 0; text-align: right; }
    .players-list h3 { font-size: 1.1rem; color: #9ca3af; margin-bottom: 20px; font-weight: 700; }
    .players-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }
    .player-tag { 
        background: white; 
        padding: 12px 16px; 
        border-radius: 16px; 
        display: flex; 
        align-items: center; 
        gap: 12px; 
        border: 2px solid #f3f4f6; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    .player-avatar { font-size: 24px; background: #f9fafb; w-10 h-10 rounded-full flex items-center justify-center; }
    .player-name { font-weight: 700; color: #374151; font-size: 0.95rem; }

    .lobby-actions { display: flex; gap: 20px; justify-content: center; align-items: center; margin-top: 50px; }
    .lobby-actions button { border-radius: 16px; font-weight: 700; padding: 15px 30px; font-size: 1.1rem; }
    .waiting-msg { color: #a855f7; font-weight: 700; animation: bounce 2s infinite; font-size: 1.1rem; }
    @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }
`;

const gameStyles = `
    .game-play { direction: rtl; max-width: 600px; margin: 0 auto; padding-top: 20px; }
    
    .game-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 30px; 
        background: white;
        padding: 20px 24px;
        border-radius: 24px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.08);
        border: 1px solid rgba(0,0,0,0.02);
    }
    
    .letter-box { display: flex; align-items: center; gap: 12px; }
    .letter-box span { font-size: 1rem; color: #9ca3af; font-weight: 700; }
    .letter-box h2 { font-size: 2.8rem; color: #a855f7; margin: 0; line-height: 1; font-weight: 900; }
    
    .timer-box { display: flex; align-items: center; gap: 10px; background: #fffcf0; color: #d97706; padding: 10px 20px; border-radius: 18px; font-weight: 800; font-size: 1rem; border: 2px solid #fef3c7; }
    .timer-danger { background: #fef2f2; color: #ef4444; border-color: #fee2e2; animation: pulse 1s infinite; }
    @keyframes pulse { 50% { transform: scale(1.05); } }

    .categories-grid { display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px; }
    .category-card { 
        text-align: right; 
        padding: 18px 24px; 
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        border: 2px solid transparent;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .category-card:focus-within { border-color: #a855f7; transform: translateY(-4px); box-shadow: 0 15px 30px rgba(168, 85, 247, 0.1); }
    
    .category-card label { display: block; font-size: 0.95rem; font-weight: 700; color: #6b7280; }
    .category-card input { 
        width: 100%; 
        padding: 8px 0; 
        border: none; 
        border-bottom: 2px solid #f3f4f6; 
        font-size: 1.25rem; 
        font-weight: 700; 
        outline: none; 
        color: #1f2937; 
        background: transparent;
        transition: border-color 0.2s;
        border-radius: 0;
    }
    .category-card input:focus { border-color: #a855f7; }
    .category-card input::placeholder { color: #d1d5db; font-weight: 400; font-size: 1.1rem; }
`;

const multiStyles = `
    .multi-results { direction: rtl; max-width: 600px; margin: 0 auto; padding-top: 40px; }
    
    .players-results-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 40px; }
    
    .player-result-card { 
        padding: 24px; 
        border-radius: 24px;
        background: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        border: 2px solid transparent; 
        transition: all 0.3s; 
    }
    .player-result-card.active-player { border-color: #a855f7; background: #faf5ff; }
    
    .player-summary { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 16px; }
    .player-identity { display: flex; gap: 15px; align-items: center; font-weight: 800; font-size: 1.2rem; color: #1f2937; }
    .avatar { font-size: 1.6rem; background: #f3f4f6; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .round-score { font-weight: 900; color: #a855f7; font-size: 1.6rem; background: rgba(168, 85, 247, 0.1); padding: 6px 16px; border-radius: 14px; }
    
    .words-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .word-item { 
        display: flex; 
        flex-direction: column; 
        gap: 6px;
        padding: 12px 14px; 
        border-radius: 16px; 
        background: #f9fafb; 
        border: 1px solid #f3f4f6; 
        position: relative;
    }
    .word-cat { color: #9ca3af; font-size: 0.8rem; font-weight: 600; }
    .word-text { font-weight: 800; color: #374151; font-size: 1rem; }
    .word-points { position: absolute; top: 12px; left: 12px; }
    
    .word-item.green { border-color: #86efac; background: #f0fdf4; }
    .word-item.yellow { border-color: #fde047; background: #fefce8; }
    .word-item.red { border-color: #fca5a5; background: #fef2f2; opacity: 0.8; }
    
    .total-score-badge { text-align: center; font-weight: 700; padding-top: 15px; border-top: 2px solid #f3f4f6; color: #6b7280; font-size: 1rem; }
`;

const resultsStyles = `
    .results-page { max-width: 600px; margin: 0 auto; direction: rtl; padding-top: 60px; }
    .results-header { 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 24px; 
        text-align: center;
        margin-bottom: 50px; 
    }
    .total-score { 
        background: white; 
        padding: 0; 
        border-radius: 50%; 
        width: 200px; 
        height: 200px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 20px 50px rgba(168, 85, 247, 0.25);
        border: 10px solid #f3e8ff;
        position: relative;
    }
    .total-score::after { content: ''; position: absolute; inset: -15px; border-radius: 50%; border: 2px dashed #e9d5ff; animation: spin 10s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .total-score h1 { font-size: 5rem; color: #a855f7; line-height: 1; margin: 0; font-weight: 900; letter-spacing: -2px; }
    .total-score p { font-size: 1rem; color: #9ca3af; margin: 0; font-weight: 700; }
    
    .results-message h3 { font-size: 2.2rem; color: #1f2937; margin-bottom: 12px; font-weight: 800; }
    .results-message p { color: #6b7280; font-size: 1.2rem; }

    .results-list { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 50px; }
    .result-card { 
        display: flex; 
        align-items: center; 
        gap: 24px; 
        padding: 20px 30px; 
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border-right: 8px solid #e5e7eb; 
    }
    .res-correct { border-right-color: #10b981; background: #f0fdf4; }
    .res-wrong { border-right-color: #ef4444; background: #fef2f2; }
    
    .res-info { flex: 1; text-align: right; }
    .res-info label { display: block; font-size: 0.9rem; color: #9ca3af; font-weight: 700; margin-bottom: 4px; }
    .res-info h3 { margin: 0; font-size: 1.4rem; color: #1f2937; font-weight: 800; }
    
    .res-points { 
        font-size: 1.4rem; 
        font-weight: 900; 
        background: white; 
        padding: 10px 16px; 
        border-radius: 14px; 
        color: #a855f7;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    
    .results-actions { display: flex; gap: 16px; justify-content: center; }
    .results-actions button { padding: 18px 32px; border-radius: 18px; font-size: 1.1rem; font-weight: 700; }
`;

export default PlayPage;
