import React, { useEffect, useState } from 'react';
import api from '../api';
import { Check, Trash2, Clock, User, Tag, Lightbulb, AlertCircle } from 'lucide-react';

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
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Lightbulb className="text-purple-600" />
                    Word Suggestions
                </h1>
                <p className="text-gray-500 mt-1">Review and accept crowdsourced words from players</p>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="table-container">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-green-50 p-4 rounded-full mb-4">
                                <Check size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">All caught up!</h3>
                            <p className="text-gray-400 mt-1">There are no pending suggestions to review.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Word</th>
                                    <th>Category</th>
                                    <th>Letter</th>
                                    <th>Suggested By</th>
                                    <th>Date</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suggestions.map(suggestion => (
                                    <tr key={suggestion.id}>
                                        <td>
                                            <span className="text-lg font-extrabold text-gray-800">{suggestion.word}</span>
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                                <Tag size={14} className="text-gray-400" /> {suggestion.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold shadow-sm">
                                                {suggestion.letter}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User size={12} className="text-gray-500" />
                                                </div>
                                                <span className="font-medium text-sm text-gray-600">{suggestion.suggested_by_name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <Clock size={12} />
                                                {new Date(suggestion.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(suggestion.id)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200 shadow-sm"
                                                    title="Approve & Add to Dictionary"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(suggestion.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
                                                    title="Reject & Delete"
                                                >
                                                    <Trash2 size={18} />
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
        </div>
    );
};

export default SuggestionsPage;
