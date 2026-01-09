import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, Plus, LogIn, Users, Info, MessageCircle, UserPlus, Zap } from 'lucide-react';
import SEO from '../components/SEO';

const MultiplayerLobby = () => {
    const { token } = useAuth();
    const { socket, rooms, currentRoom, onlinePlayers, onlineVisitors, createRoom, joinRoom } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [newRoomName, setNewRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    // Check for join param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const joinId = params.get('join');
        if (joinId) {
            joinRoom(joinId);
            // Clear param
            navigate(location.pathname, { replace: true });
        }
    }, [location, joinRoom, navigate]);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // If user is already in a room, navigate to it
    useEffect(() => {
        if (currentRoom) {
            navigate(`/play/multiplayer/room/${currentRoom.id}`);
        }
    }, [currentRoom, navigate]);

    const handleCreateRoom = () => {
        if (newRoomName.trim()) {
            createRoom(newRoomName);
            setNewRoomName('');
            // Navigation will happen automatically via useEffect when currentRoom updates
        }
    };

    const handleJoinRoom = (roomId) => {
        joinRoom(roomId);
        // Navigation will happen automatically via useEffect when currentRoom updates
    };

    const handleJoinByCode = () => {
        if (roomCode.trim()) {
            joinRoom(roomCode.trim());
            setRoomCode('');
            // Navigation will happen automatically via useEffect when currentRoom updates
        }
    };

    return (
        <div className="multiplayer-lobby-page container mx-auto px-4 py-8" dir="rtl">
            <SEO title="اللعب الجماعي" description="تحدى أصدقاءك في غرف لعب مباشرة. أنشئ غرفة أو انضم باستخدام الكود. أوتوبيس كومبليت هي أشهر لعبة كلمات عربية أونلاين." />

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all">
                        <HomeIcon size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">غرف اللعب الجماعي 🎮</h1>
                        <p className="text-gray-500 font-medium">تنافس مع اللاعبين في الوقت الفعلي</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-xl">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold text-green-700">{onlinePlayers} لاعب</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-xl">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm font-bold text-blue-700">{onlineVisitors} زائر</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Actions and Guide */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Guide Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2rem] text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Info size={20} /> كيف تلعب مع أصدقائك؟
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <p className="text-sm opacity-90"><b>أنشئ غرفة:</b> اختر اسماً مميزاً لغرفتك وقم بإنشائها.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <p className="text-sm opacity-90"><b>ادعُ أصدقاءك:</b> شارك كود الغرفة (ID) مع أصدقائك ليتمكنوا من الانضمام.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <p className="text-sm opacity-90"><b>ابدأ التحدي:</b> بمجرد دخول أصدقائك، اضغط على "ابدأ اللعبة".</p>
                            </div>
                        </div>
                    </div>

                    {/* Create Room Card */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Plus size={20} className="text-purple-600" /> إنشاء غرفة
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">كن المضيف وابدأ جولة جديدة</p>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="اسم الغرفة..."
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                                className="w-full p-4 pr-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none transition-all font-bold"
                            />
                            <button
                                onClick={handleCreateRoom}
                                disabled={!newRoomName.trim()}
                                className="absolute left-2 top-2 p-2 bg-purple-600 text-white rounded-xl disabled:opacity-50"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Join by Code Card */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Zap size={20} className="text-amber-500" /> انضم عبر الكود
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">أدخل كود الغرفة الذي أرسله لك صديقك</p>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="أدخل ID الغرفة..."
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                                className="w-full p-4 pr-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-amber-500 rounded-2xl outline-none transition-all font-bold uppercase tracking-widest"
                            />
                            <button
                                onClick={handleJoinByCode}
                                disabled={!roomCode.trim()}
                                className="absolute left-2 top-2 p-2 bg-amber-500 text-white rounded-xl disabled:opacity-50"
                            >
                                <LogIn size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Rooms List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users size={22} className="text-purple-600" /> الغرف النشطة حالياً
                            </h3>
                            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                                {rooms.length} غرف
                            </span>
                        </div>

                        {rooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                                    🎮
                                </div>
                                <h4 className="text-xl font-bold text-gray-400 mb-2">لا توجد غرف نشطة</h4>
                                <p className="text-gray-300 max-w-xs">كن أول من ينشئ غرفة الآن وادعُ أصدقاءك للتحدي!</p>
                                <button
                                    onClick={() => document.querySelector('input').focus()}
                                    className="mt-6 text-purple-600 font-bold hover:underline"
                                >
                                    + أنشئ أول غرفة
                                </button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="grid gap-4">
                                    {rooms.map(room => (
                                        <div key={room.id} className="group p-4 bg-white border-2 border-gray-50 hover:border-purple-100 rounded-3xl flex items-center justify-between transition-all hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl font-black">
                                                    {room.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg leading-tight">{room.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">ID: {room.id}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${room.status === 'lobby' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {room.status === 'lobby' ? 'متاح' : 'في اللعب'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-left">
                                                    <span className="text-lg font-black text-gray-700">{room.players}</span>
                                                    <span className="text-xs text-gray-400 ml-1">/{room.maxPlayers}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinRoom(room.id)}
                                                    disabled={room.status !== 'lobby' || room.players >= room.maxPlayers}
                                                    className="p-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-bold disabled:opacity-30 disabled:grayscale px-6"
                                                >
                                                    انضمام
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .multiplayer-lobby-page { min-height: 90vh; }
                @media (max-width: 640px) {
                    .multiplayer-lobby-page { padding-top: 20px; }
                    .players-grid-lobby { grid-template-columns: repeat(2, 1fr); }
                }
            `}} />
        </div>
    );
};

export default MultiplayerLobby;
