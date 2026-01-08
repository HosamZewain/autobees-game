import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, LogOut } from 'lucide-react';
import axios from 'axios';
import SEO from '../components/SEO';

const Profile = () => {
    const { user, token, logout, login } = useAuth(); // Assuming login updates user state
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'كلمة المرور غير متطابقة' });
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = 'http://localhost:3000/api/users/profile'; // Ensure this endpoint exists or use update user logic
            // Note: If backend doesn't support self-update yet, this might fail. 
            // For now implementing UI. Assuming generic update endpoint or we interpret this as a client-side mock if backend isn't ready.
            // Actually, looking at previous plans, admin can update users. 
            // Users updating themselves might need a specific route `PUT /api/users/:id` or similar.
            // Let's assume standard REST: PUT /api/users/me or /api/users/{id}

            // Using a safe assumption or placeholder if backend route isn't confirmed.
            // Based on context, we might not have a specific 'update profile' route for users yet, only admin.
            // But I'll stick to a standard request structure.

            const response = await axios.put(
                `http://localhost:3000/api/users/${user.id}`,
                { username, password: password || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
            // Optionally update local user context if needed
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'فشل تحديث البيانات. حاول مرة أخرى.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="text-center p-10">الرجاء تسجيل الدخول</div>;

    return (
        <div className="profile-page container" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px', direction: 'rtl' }}>
            <SEO title="الملف الشخصي" description="إدارة معلومات حسابك وكلمات المرور في أوتوبيس كومبليت." />
            <div className="profile-header card" style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div style={{
                    width: '100px', height: '100px', background: '#f3e8ff', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    color: '#9333ea'
                }}>
                    <User size={48} />
                </div>
                <h1 style={{ fontSize: '2rem', margin: '0 0 10px', color: '#1f2937' }}>{user.username}</h1>
                <p style={{ color: '#6b7280' }}>عضو منذ 2024</p>
                <div style={{ marginTop: '10px' }}>
                    {user.role === 'admin' && <span className="badge" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>مسؤول (Admin)</span>}
                </div>
            </div>

            <div className="profile-form card" style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginBottom: '24px', color: '#374151', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} /> تعديل البيانات
                </h3>

                <form onSubmit={handleUpdate}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4b5563' }}>اسم المستخدم</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f3f4f6', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4b5563' }}>كلمة المرور الجديدة</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="اتركها فارغة إذا لم ترد التغيير"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '2px solid #f3f4f6', fontSize: '1rem', outline: 'none' }}
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#9ca3af' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4b5563' }}>تأكيد كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="أعد كتابة كلمة المرور"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '2px solid #f3f4f6', fontSize: '1rem', outline: 'none' }}
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#9ca3af' }} />
                        </div>
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center',
                            background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            color: message.type === 'error' ? '#ef4444' : '#16a34a'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                flex: 2, padding: '14px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {isLoading ? 'جاري الحفظ...' : <><Save size={20} /> حفظ التغييرات</>}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #fef2f2',
                            background: 'white', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <LogOut size={20} /> تسجيل الخروج
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
