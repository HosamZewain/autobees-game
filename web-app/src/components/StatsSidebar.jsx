import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Users, Wifi } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const StatsSidebar = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const { onlinePlayers, onlineVisitors } = useSocket();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/leaderboard');
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
                        topPlayers.slice(0, 5).map((player, index) => (
                            <div key={index} className="mini-player-row">
                                <span className={`rank rank-${index + 1}`}>#{index + 1}</span>
                                <Link to={`/profile/${player.username}`} className="player-name hover:text-purple-600 transition-colors w-full text-right block truncate">
                                    {player.username}
                                </Link>
                                <span className="player-score">{player.total_score}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">جاري التحميل...</div>
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
