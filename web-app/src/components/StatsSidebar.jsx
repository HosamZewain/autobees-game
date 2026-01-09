import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Users, Wifi, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

import { API_BASE } from '../config';

const StatsSidebar = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const { onlinePlayers, onlineVisitors } = useSocket();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_BASE}/leaderboard`);
                setTopPlayers(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };
        fetchLeaderboard();
        // Refresh leaderboard every minute
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="stats-sidebar">
            {/* Top Player Widget */}
            <div className="sidebar-widget">
                <div className="widget-header">
                    <Trophy size={20} className="icon-gold" />
                    <h3>أفضل اللاعبين</h3>
                </div>
                <div className="leaderboard-mini-list">
                    {topPlayers.length > 0 ? (
                        topPlayers.slice(0, 10).map((player, index) => (
                            <div key={index} className="mini-player-row flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <span className={`rank rank-${index + 1} flex-shrink-0 w-6 text-center font-bold`}>#{index + 1}</span>

                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 flex-shrink-0 flex items-center justify-center">
                                    {player.profile_pic ? (
                                        <img
                                            src={player.profile_pic}
                                            alt={player.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-purple-600">
                                            {player.username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    to={`/profile/${player.username}`}
                                    className="flex-1 min-w-0 flex items-center gap-1 group"
                                >
                                    <span className="player-name font-bold text-gray-800 group-hover:text-purple-600 truncate text-sm">
                                        {player.username}
                                    </span>
                                    <ExternalLink size={12} className="text-gray-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>

                                <span className="player-score font-bold text-purple-600 text-xs flex-shrink-0">{player.total_score}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-data p-4 text-center text-gray-400 text-sm">جاري التحميل...</div>
                    )}
                </div>
            </div>

            {/* Online Players Widget */}
            <div className="sidebar-widget">
                <div className="widget-header">
                    <Wifi size={20} className="icon-green" />
                    <h3>المتصلين الآن</h3>
                </div>
                <div className="online-status-box">
                    <div className="players-stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">لاعبين</span>
                            <span className="stat-value">{onlinePlayers || 0}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-label">زوار</span>
                            <span className="stat-value">{onlineVisitors || 0}</span>
                        </div>
                    </div>
                    <p className="online-hint">ابدأ تحدي جماعي الآن!</p>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
        </aside>
    );
};

export default StatsSidebar;

/* Update StatsSidebar.css or add styles here if needed */
const styles = `
.players-stats-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: #f8fafc;
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 10px;
}
.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.stat-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
}
.stat-item:first-child .stat-value {
    color: #16a34a; /* Green for players */
}
.stat-item:last-child .stat-value {
    color: #2563eb; /* Blue for visitors */
}
.stat-divider {
    width: 1px;
    height: 30px;
    background: #e2e8f0;
}
`;
