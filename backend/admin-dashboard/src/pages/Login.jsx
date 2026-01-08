import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Using same login endpoint as main app
            const response = await api.post('/auth/login', { email: username, password }); // Username field in form, but check if backend accepts email/username
            // Actually, backend expects `email` and `password`. If username is entered, we might need a workaround or ensure backend supports username login.
            // Wait, standard login usually takes email. Admin user has email admin@autobees.site.

            // Backend login expects email. But typically admin panel logins use username.
            // Let's assume input is email for now or modify check.
            // Actually, for admin convenience, let's try sending it as email field.

            // Checking backend logic: const { email, password } = req.body;
            // It searches by email using `getUserByEmail`.
            // So we MUST enter email.

            const user = response.data.user;

            if (user.role !== 'admin') {
                setError('Access denied: Admins only.');
                setLoading(false);
                return;
            }

            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/50 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-4 transform rotate-3">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Admin &bull; AutoBees</h1>
                    <p className="text-gray-500 font-medium mt-1">Sign in to manage the game</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text" // Type text to allow username or email semantically, but backend needs email
                            placeholder="Admin Email"
                            className="input pl-11 py-3 text-lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="input pl-11 py-3 text-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary py-3.5 text-lg justify-center mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In Dashboard'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400 font-medium">
                    &copy; 2024 Autobees Game Admin Panel
                </div>
            </div>
        </div>
    );
};

export default Login;
