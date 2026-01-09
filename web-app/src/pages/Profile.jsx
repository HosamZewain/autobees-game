import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config';

const Profile = () => {
    const { user, token, updateUser } = useAuth(); // login function updates the context state
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        profile_pic: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                gender: user.gender || '',
                profile_pic: user.profile_pic || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check original size (just as a sanity check, though we resize anyway)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'حجم الملف كبير جداً' });
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize to max 500x500 maintaining aspect ratio
                    const MAX_SIZE = 500;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, profile_pic: dataUrl }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'كلمة المرور غير متطابقة' });
            return;
        }

        setIsLoading(true);
        try {
            // Using the correct endpoint
            const endpoint = `${API_BASE}/auth/profile`;

            const payload = {
                username: formData.username,
                email: formData.email,
                gender: formData.gender,
                profile_pic: formData.profile_pic
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await axios.put(endpoint, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update Auth Context with new user data and token
            updateUser(response.data.token, response.data.user);

            setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح!' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear password fields

        } catch (error) {
            console.error('Update Profile Error:', error);
            const errorMsg = error.response?.data?.error || 'حدث خطأ أثناء التحديث. حاول مرة أخرى.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-20 max-w-2xl min-h-screen">
            <SEO title="تعديل الملف الشخصي" description="قم بتحديث معلومات حسابك في أوتوبيس كومبليت" />

            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h1 className="text-3xl font-black relative z-10">تعديل الملف الشخصي</h1>
                    <p className="opacity-80 mt-2 relative z-10">قم بتحديث معلوماتك وصورتك الشخصية</p>
                </div>

                <div className="p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-purple-100 shadow-inner overflow-hidden relative bg-gray-100">
                                    {formData.profile_pic ? (
                                        <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg border-2 border-white transform translate-x-1 translate-y-1">
                                    <Camera size={16} />
                                </div>
                            </div>
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <p className="mt-3 text-sm text-gray-500 font-medium">اضغط لتغيير الصورة (الحد الأقصى 5MB)</p>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 mr-1">اسم المستخدم</label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-gray-700"
                                        placeholder="اسم المستخدم"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2 mr-1">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-gray-700"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2 mr-1">الجنس (اختياري)</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 border-2 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-xl">👨</span>
                                        <span className="font-bold">ذكر</span>
                                    </label>
                                    <label className={`flex-1 border-2 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-xl">👩</span>
                                        <span className="font-bold">أنثى</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                                <Lock size={20} className="text-purple-600" />
                                تغيير كلمة المرور
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-gray-700"
                                        placeholder="كلمة المرور الجديدة (اتركه فارغاً للإبقاء عليها)"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-gray-700"
                                        placeholder="تأكيد كلمة المرور"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
