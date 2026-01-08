import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock, Trophy, Users } from 'lucide-react';

const History = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/admin/history');
            setMatches(response.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Match History</h1>
                <p className="text-gray-500 mt-1">Recent multiplayer games played</p>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="table-container">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading history...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Room ID</th>
                                    <th>Played</th>
                                    <th>Winner</th>
                                    <th>Players</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.length > 0 ? matches.map((match) => {
                                    const details = typeof match.details === 'string'
                                        ? JSON.parse(match.details)
                                        : match.details;

                                    const winner = details.players && details.players.length > 0
                                        ? details.players.reduce((prev, current) => (prev.score > current.score) ? prev : current)
                                        : { name: 'N/A', score: 0 };

                                    const playerCount = details.players ? details.players.length : 0;

                                    return (
                                        <tr key={match.id}>
                                            <td className="text-gray-400 font-mono">#{match.id}</td>
                                            <td className="font-mono text-sm">{match.room_id}</td>
                                            <td>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Clock size={14} className="text-purple-400" />
                                                    {formatDate(match.played_at)}
                                                </div>
                                            </td>
                                            <td>
                                                {winner.name !== 'N/A' && (
                                                    <div className="flex items-center gap-2">
                                                        <Trophy size={14} className="text-yellow-500" />
                                                        <span className="font-bold text-gray-800">{winner.name}</span>
                                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-md font-bold">{winner.score}pts</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                                                        <Users size={14} className="text-blue-400" />
                                                        <span>{playerCount}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {details.players && details.players.map(p => p.name || p.username).join(', ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-400">No match history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
