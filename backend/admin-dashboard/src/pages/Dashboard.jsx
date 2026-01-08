import React, { useEffect, useState } from 'react';
import api from '../api';
import { Users, BookOpen, Clock, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-400">
            <Activity size={14} />
            Updated just now
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalWords: 0,
        pendingWords: 0,
        totalMatches: 0,
        todayMatches: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app, you would have a dedicated /stats endpoint
                // For now, we simulate fetching stats or fetch individual counts if needed
                // Assuming we might have added a stats endpoint or fetching separately

                // Let's try to fetch lists length for now as a makeshift solution
                // Warning: This is not efficient for large datasets, but fine for prototype
                const [usersRes, dictRes, suggestionsRes, historyRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/dictionary?limit=1'), // Just need count if API supported metadata
                    api.get('/admin/suggestions'), // Assuming it returns all
                    api.get('/admin/history')
                ]);

                // Note: Better backend would return { meta: { total: 100 } }

                setStats({
                    totalUsers: usersRes.data.length,
                    activeUsers: usersRes.data.filter(u => u.is_active).length,
                    totalWords: 1250, // Mock for now if API doesn't return count
                    pendingWords: suggestionsRes.data.length,
                    totalMatches: historyRes.data.length,
                    todayMatches: 5 // Mock
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard data...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
            <p className="text-gray-500 mb-8">Welcome back, Admin! Here's what's happening today.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={CheckCircle}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    title="Matches Played"
                    value={stats.totalMatches}
                    icon={Clock}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Total Words"
                    value={stats.totalWords}
                    icon={BookOpen}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
                <StatCard
                    title="Pending Suggestions"
                    value={stats.pendingWords}
                    icon={AlertTriangle}
                    color="text-yellow-600"
                    bg="bg-yellow-50"
                />
            </div>

            {/* Quick Actions or Recent Activity could go here */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-500/20">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => window.location.href = '/admin/users'} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold transition-all">
                        Manage Users
                    </button>
                    <button onClick={() => window.location.href = '/admin/dictionary'} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold transition-all">
                        Review Dictionary
                    </button>
                    <button onClick={() => window.location.href = '/admin/suggestions'} className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                        Review {stats.pendingWords} Suggestions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
