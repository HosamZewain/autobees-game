import React, { useEffect, useState } from 'react';
import api from '../api';
import { Users, Gamepad2, Trophy, Activity, BookOpen, Layers } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setError(null);
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
            setError('Failed to load dashboard data. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Live update every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="loader">Loading Dashboard...</div>
        </div>
    );

    if (error) return (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
            <h3>{error}</h3>
            <button onClick={fetchStats} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Overview</h1>
                    <p style={{ color: '#6b7280' }}>Real-time game monitoring and statistics.</p>
                </div>
                <button onClick={fetchStats} className="btn btn-secondary">
                    Refresh Now
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Active Rooms"
                    value={stats.activeRooms}
                    icon={<Gamepad2 size={24} color="#f59e0b" />}
                    color="orange"
                />
                <StatCard
                    title="Online Players"
                    value={stats.connectedPlayers}
                    icon={<Activity size={24} color="#10b981" />}
                    color="green"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users size={24} color="#3b82f6" />}
                    color="blue"
                />
                <StatCard
                    title="Total Games"
                    value={stats.totalGames}
                    icon={<Trophy size={24} color="#8b5cf6" />}
                    color="purple"
                />
                <StatCard
                    title="Dictionary Words"
                    value={stats.totalWords}
                    icon={<BookOpen size={24} color="#ec4899" />}
                    color="pink"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Live Games Table */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Current Live Games</h2>
                        <span className="badge badge-success">{stats.roomsDetails.length} Active</span>
                    </div>

                    {stats.roomsDetails.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            No games running right now.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Room ID</th>
                                        <th>Players</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.roomsDetails.map(room => (
                                        <tr key={room.roomId}>
                                            <td><span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{room.roomId}</span></td>
                                            <td>{room.players}/∞</td>
                                            <td>
                                                <Badge status={room.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Leaderboard */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                        <Trophy size={20} color="#f59e0b" />
                        <h2>Top Players</h2>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Wins</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topUsers.map((user, index) => (
                                <tr key={user.username}>
                                    <td>#{index + 1}</td>
                                    <td style={{ fontWeight: '500' }}>{user.username}</td>
                                    <td>
                                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>{user.wins}</span>
                                    </td>
                                    <td>{user.total_score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner code
const StatCard = ({ title, value, icon, color }) => (
    <div className="card stat-card" style={{ borderTop: `4px solid ${color === 'orange' ? '#f59e0b' : color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : '#ec4899'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>
                    {(value || 0).toLocaleString()}
                </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f3f4f6' }}>
                {icon}
            </div>
        </div>
    </div>
);

const Badge = ({ status }) => {
    let bg = '#e5e7eb';
    let text = '#374151';

    if (status === 'playing') {
        bg = '#d1fae5';
        text = '#065f46';
    } else if (status === 'lobby') {
        bg = '#dbeafe';
        text = '#1e40af';
    } else if (status === 'results') {
        bg = '#fef3c7';
        text = '#92400e';
    }

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: bg,
            color: text,
            textTransform: 'uppercase'
        }}>
            {status}
        </span>
    );
};

export default Dashboard;
