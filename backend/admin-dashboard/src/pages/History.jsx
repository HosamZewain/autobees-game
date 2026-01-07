import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock } from 'lucide-react';

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
        <div>
            <div className="page-header">
                <h1>Game History</h1>
            </div>

            <div className="card">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Room ID</th>
                                <th>Played At</th>
                                <th>Winner</th>
                                <th>Players</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => {
                                const details = typeof match.details === 'string'
                                    ? JSON.parse(match.details)
                                    : match.details;

                                const winner = details.players && details.players.length > 0
                                    ? details.players.reduce((prev, current) => (prev.score > current.score) ? prev : current)
                                    : { name: 'N/A', score: 0 };

                                return (
                                    <tr key={match.id}>
                                        <td>{match.id}</td>
                                        <td>{match.room_id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                {formatDate(match.played_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-success">
                                                {winner.name} ({winner.score})
                                            </span>
                                        </td>
                                        <td>{details.players ? details.players.length : 0}</td>
                                    </tr>
                                );
                            })}
                            {matches.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No games played yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default History;
