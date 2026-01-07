import React, { useEffect, useState } from 'react';
import api from '../api';
import { Check, Trash2, Clock, User, Tag } from 'lucide-react';

const SuggestionsPage = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/suggestions');
            setSuggestions(response.data);
        } catch (error) {
            console.error('Failed to fetch suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/suggestions/${id}/approve`);
            setSuggestions(suggestions.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to approve word');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this suggestion?')) return;
        try {
            await api.delete(`/admin/suggestions/${id}`);
            setSuggestions(suggestions.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to delete suggestion');
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Word Suggestions</h1>
                <p style={{ color: '#6b7280' }}>Review and approve words suggested by players during gameplay.</p>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading suggestions...</div>
                ) : suggestions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        No pending suggestions at the moment.
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Category</th>
                                <th>Letter</th>
                                <th>Suggested By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map(suggestion => (
                                <tr key={suggestion.id}>
                                    <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{suggestion.word}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Tag size={14} /> {suggestion.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: '#fef3c7',
                                            color: '#92400e',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {suggestion.letter}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} />
                                            <span>{suggestion.suggested_by_name || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.9rem' }}>
                                            <Clock size={14} />
                                            {new Date(suggestion.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleApprove(suggestion.id)}
                                                style={{ color: '#10b981', background: '#ecfdf5', padding: '6px', borderRadius: '6px' }}
                                                title="Approve"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(suggestion.id)}
                                                style={{ color: '#ef4444', background: '#fef2f2', padding: '6px', borderRadius: '6px' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SuggestionsPage;
