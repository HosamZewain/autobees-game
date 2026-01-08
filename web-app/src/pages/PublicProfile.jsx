import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { User, Trophy, XCircle, Calendar, ArrowLeft } from 'lucide-react';

import { API_BASE } from '../config';

const PublicProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Using the specific public endpoint
                const response = await axios.get(`${API_BASE}/users/public/${id}`);
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching public profile:", err);
                setError('تعذر تحميل بيانات المستخدم. قد يكون الحساب غير موجود.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center max-w-md">
                    <XCircle size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
                    <p>{error || 'المستخدم غير موجود'}</p>
                    <Link to="/" className="mt-6 inline-flex items-center gap-2 text-purple-600 font-bold hover:underline">
                        <ArrowLeft size={20} />
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate win rate
    const totalGames = (profile.wins || 0) + (profile.losses || 0);
    const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;

    return (
        <div className="container mx-auto px-4 py-8 pb-20 max-w-2xl min-h-screen">
            <SEO title={`الملف الشخصي: ${profile.username}`} description={`تعرف على إحصائيات اللاعب ${profile.username} في أوتوبيس كومبليت`} />

            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-8 transition-colors">
                <ArrowLeft size={20} />
                العودة
            </Link>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-50 relative">
                {/* Cover/Header */}
                <div className="h-40 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                {/* Profile Pic & Info */}
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col items-center -mt-20 mb-6">
                        <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center relative z-10">
                            {profile.profile_pic ? (
                                <img src={profile.profile_pic} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} className="text-gray-300" />
                            )}
                        </div>

                        <div className="text-center mt-4">
                            <h1 className="text-3xl font-black text-gray-800 mb-1">{profile.username}</h1>
                            <div className="flex items-center justify-center gap-2 text-gray-500 font-medium text-sm">
                                <span>{profile.role === 'admin' ? 'مشرف 🛡️' : 'لاعب 🎮'}</span>
                                {profile.gender && <span>• {profile.gender === 'male' ? 'ذكر 👨' : 'أنثى 👩'}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-purple-50 p-4 rounded-2xl text-center border border-purple-100">
                            <div className="text-2xl font-black text-purple-600 mb-1">{profile.total_score}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">مجموع النقاط</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                            <div className="text-2xl font-black text-green-600 mb-1">{profile.wins}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">فوز 🏆</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                            <div className="text-2xl font-black text-red-500 mb-1">{profile.losses}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">خسارة ❌</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                            <div className="text-2xl font-black text-blue-600 mb-1">{winRate}%</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">نسبة الفوز 📈</div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="bg-white p-2 rounded-xl text-purple-500 shadow-sm">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">تاريخ الانضمام</p>
                                <p className="font-bold text-gray-800 dir-ltr">
                                    {profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير معروف'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
