import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Timer, Send, Play, Home as HomeIcon, CheckCircle, XCircle,
    AlertCircle, ArrowRight, Trophy, Clock, Copy, Link as LinkIcon
} from 'lucide-react';
import SEO from '../components/SEO';

const MultiplayerGame = () => {
    const { roomId } = useParams();
    const { user, token } = useAuth();
    const {
        socket,
        currentRoom,
        roundResults,
        gameStarted,
        leaveRoom,
        startGame,
        submitAnswers,
        nextRound
    } = useSocket();
    const navigate = useNavigate();

    // Local state for multiplayer answers (separate from solo)
    const [multiAnswers, setMultiAnswers] = useState({});
    const [countdown, setCountdown] = useState(0);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // If not in a room or room doesn't match URL, go back to lobby
    useEffect(() => {
        if (!currentRoom || currentRoom.id !== roomId) {
            navigate('/play/multiplayer');
        }
    }, [currentRoom, roomId, navigate]);

    // Reset answers when new round starts
    useEffect(() => {
        if (currentRoom?.status === 'playing' && currentRoom.letter) {
            setMultiAnswers({});
        }
    }, [currentRoom?.status, currentRoom?.letter]);

    // Countdown timer for next round
    useEffect(() => {
        if (roundResults && !roundResults.isFinal && roundResults.nextRoundIn) {
            setCountdown(roundResults.nextRoundIn);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [roundResults]);

    const updateMultiAnswer = (category, value) => {
        setMultiAnswers(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleSubmit = () => {
        console.log('handleSubmit called with answers:', multiAnswers);
        console.log('currentRoom:', currentRoom);
        submitAnswers(multiAnswers);
    };

    const handleLeaveRoom = () => {
        leaveRoom();
        navigate('/play/multiplayer');
    };

    // Safety check
    if (!currentRoom) {
        return (
            <div className="text-center p-10">
                <h2 className="mb-4">جاري التحميل...</h2>
            </div>
        );
    }

    const isHost = (currentRoom.ownerUserId && currentRoom.ownerUserId == user?.id) ||
        (currentRoom.players && currentRoom.players[0] && currentRoom.players[0].userId == user?.id);
    const isPlaying = currentRoom.status === 'playing';
    const isFinished = currentRoom.status === 'finished';
    const roomCategories = currentRoom.config?.categories || ['إنسان', 'حيوان', 'نبات', 'جماد', 'بلاد'];

    console.log('MultiplayerGame Debug:', {
        isHost,
        userId: user?.id,
        ownerUserId: currentRoom.ownerUserId,
        status: currentRoom.status,
        playersCount: currentRoom.players?.length
    });

    // FINAL RESULTS STATE
    if (isFinished) {
        const players = currentRoom.players || [];
        const sorted = [...players].sort((a, b) => b.score - a.score);
        const winner = sorted[0];

        return (
            <div className="multi-results container mx-auto pt-10 pb-20 max-w-3xl px-4">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-block p-8 rounded-full bg-gradient-to-br from-yellow-50 to-amber-100 mb-6 shadow-xl relative">
                        <Trophy size={80} className="text-amber-500 drop-shadow-md" />
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-lg">1</div>
                    </div>
                    <h1 className="text-5xl font-black text-gray-800 mb-3 tracking-tight">انتهت اللعبة!</h1>
                    <p className="text-xl text-gray-500 font-medium">الفائز بالمركز الأول هو</p>
                    <div className="mt-2 inline-block px-6 py-2 bg-purple-50 rounded-full">
                        <span className="text-3xl font-black text-purple-600">{winner?.username}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-50 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">ترتيب اللاعبين</span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">مجموع النقاط</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {sorted.map((p, i) => (
                            <div key={p.id} className={`flex items-center justify-between p-6 transition-colors hover:bg-gray-50/50 ${i === 0 ? 'bg-amber-50/30' : ''}`}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-lg ${i === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-100' :
                                        i === 1 ? 'bg-gray-300 text-white' :
                                            i === 2 ? 'bg-orange-300 text-white' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shadow-inner">
                                            {p.profile_pic ? <img src={p.profile_pic} alt="" className="w-full h-full rounded-full" /> : '👤'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-black text-xl ${i === 0 ? 'text-gray-800' : 'text-gray-600'}`}>
                                                {p.username} {i === 0 && '👑'}
                                            </span>
                                            {p.wins !== undefined && (
                                                <span className="text-[10px] text-gray-400 font-bold">
                                                    فوز: {p.wins} | خسارة: {p.losses}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-black text-2xl ${i === 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                    {p.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <button
                        onClick={handleLeaveRoom}
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2"
                    >
                        <HomeIcon size={20} />
                        <span>خروج</span>
                    </button>

                    {isHost && (
                        <button
                            onClick={startGame}
                            className="btn bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-purple-100 flex items-center gap-2"
                        >
                            <Play size={20} />
                            <span>لعبة جديدة</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ROUND RESULTS STATE
    if (roundResults) {
        return (
            <div className="multi-results container mx-auto pt-10 pb-20 max-w-6xl">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 text-center mb-10 relative overflow-hidden border border-purple-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-purple-700 mb-2">نتائج الجولة {roundResults.round}</h1>
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1 rounded-full font-bold">
                            <span>الحرف:</span>
                            <span className="text-2xl">{roundResults.letter}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {roundResults.players.map(player => {
                        const playerResult = roundResults.results[player.id || player.socketId] || { categories: {}, total: 0 };
                        const isMe = player.id === socket?.id || player.socketId === socket?.id;

                        return (
                            <div key={player.id} className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${isMe ? 'border-purple-400 ring-4 ring-purple-50' : 'border-gray-50'}`}>
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl shadow-inner">
                                            {player.profile_pic ? <img src={player.profile_pic} alt="" className="w-full h-full rounded-full" /> : '👤'}
                                        </div>
                                        <div>
                                            <span className="font-black text-lg text-gray-800 block">{player.name || player.username}</span>
                                            {isMe && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase">أنت</span>}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-purple-600">+{playerResult.total || 0}</span>
                                        <span className="text-[10px] text-gray-400 block font-bold uppercase">نقطة</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.entries(playerResult.categories || {}).map(([cat, info]) => (
                                        <div key={cat} className={`p-3 rounded-2xl border flex flex-col relative transition-all hover:scale-105 ${info.type === 'green' ? 'bg-green-50 border-green-100' : info.type === 'yellow' ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'}`}>
                                            <span className="text-[10px] text-gray-400 font-black mb-1 truncate uppercase">{cat}</span>
                                            <span className={`font-bold text-sm truncate ${info.value ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                                                {info.value || 'لا يوجد'}
                                            </span>
                                            <span className="absolute top-2 left-2">
                                                {info.type === 'green' && <CheckCircle size={14} className="text-green-500" strokeWidth={3} />}
                                                {info.type === 'yellow' && <AlertCircle size={14} className="text-yellow-500" strokeWidth={3} />}
                                                {info.type === 'red' && <XCircle size={14} className="text-red-400" strokeWidth={3} />}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!roundResults.isFinal && countdown > 0 && (
                    <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 text-center animate-pulse">
                        <div className="flex items-center justify-center gap-3">
                            <Clock size={32} className="text-purple-600" />
                            <div>
                                <p className="text-2xl font-black text-purple-700">الجولة التالية تبدأ في:</p>
                                <p className="text-5xl font-black text-purple-600 mt-2">{countdown}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={handleLeaveRoom} className="btn bg-gray-100 hover:bg-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-black">مغادرة</button>
                    {/* Auto-navigation handles next round, no button needed */}
                </div>
            </div>
        );
    }

    // PLAYING STATE
    if (isPlaying) {
        const hostPlayer = currentRoom.players?.find(p => p.userId == currentRoom.ownerUserId) || currentRoom.players?.[0];

        return (
            <div className="game-play container">
                <SEO title={`تحدي جماعي - حرف ${currentRoom.letter}`} description={`تحدي مباشر مع الأصدقاء في غرفة ${currentRoom.config?.name || currentRoom.name}.`} />

                {/* Room Info Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex justify-between items-center" dir="rtl">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{currentRoom.config?.name || currentRoom.name || `غرفة ${currentRoom.id}`}</h3>
                        <p className="text-sm text-gray-500">المضيف: {hostPlayer?.name || hostPlayer?.username || 'غير معروف'} 👑</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">جولة {currentRoom.round || 1}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">ID: {currentRoom.id}</span>
                    </div>
                </div>

                <div className="game-header">
                    <div className="letter-box">
                        <span>الحرف:</span>
                        <h2>{currentRoom.letter}</h2>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl px-6 py-3 flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <span className="text-purple-700 font-black text-lg">أول من يرسل ينهي الجولة!</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSubmit} className="btn btn-primary px-6 rounded-xl">
                            إرسال <Send size={20} className="mr-2" />
                        </button>
                        <button onClick={handleLeaveRoom} className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-xl">
                            مغادرة
                        </button>
                    </div>
                </div>

                <div className="categories-grid">
                    {roomCategories.map((cat) => (
                        <div key={cat} className="category-card">
                            <label>{cat}</label>
                            <input
                                type="text"
                                value={multiAnswers[cat] || ''}
                                onChange={(e) => updateMultiAnswer(cat, e.target.value)}
                                autoFocus={cat === roomCategories[0]}
                                placeholder="..."
                                autoComplete="off"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }



    // LOBBY STATE (waiting for players)
    return (
        <div className="lobby-container">
            <SEO title={`غرفة ${currentRoom.name || currentRoom.id}`} description={`في انتظار اللاعبين في غرفة ${currentRoom.name || currentRoom.id}. كن مستعداً للتحدي!`} />
            <div className="lobby-header-card">
                <h1 className="text-3xl font-black text-gray-800 mb-2">{currentRoom.config?.name || currentRoom.name || `غرفة ${currentRoom.id}`}</h1>

                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="lobby-id-badge">ID: {currentRoom.id}</div>
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/join/${currentRoom.id}`;
                            navigator.clipboard.writeText(link);
                            // Optional: Show toast
                            alert('تم نسخ رابط الغرفة!');
                        }}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-purple-200 transition-colors"
                    >
                        <Copy size={14} /> نسخ الرابط
                    </button>
                </div>

                <div className="players-grid-lobby">
                    {currentRoom.players.map(p => (
                        <div key={p.id} className="player-card-lobby">
                            <div className="player-avatar-large">
                                {((currentRoom.ownerUserId && p.userId == currentRoom.ownerUserId) || currentRoom.players[0].id === p.id) ? '👑' : '👤'}
                            </div>
                            <div className="font-bold text-gray-700">{p.name || p.username}</div>
                            {p.userId === user?.id && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-bold">أنت</span>}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={handleLeaveRoom} className="cancel-btn">مغادرة</button>
                    {isHost ? (
                        <button
                            onClick={() => {
                                console.log('Start button clicked, calling startGame()');
                                startGame();
                            }}
                            className="start-btn flex items-center gap-2"
                        >
                            <Play size={20} /> ابدأ اللعبة
                        </button>
                    ) : (
                        <div className="text-purple-600 font-bold animate-pulse flex items-center gap-2">
                            <Clock size={20} /> في انتظار المضيف...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiplayerGame;
