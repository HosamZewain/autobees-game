import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, Plus, Search, Filter, Upload } from 'lucide-react';

const Dictionary = () => {
    const [words, setWords] = useState([]);
    const [category, setCategory] = useState('');
    const [letter, setLetter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ byCategory: [], byLetter: [] });
    const [showStats, setShowStats] = useState(false);

    const [newWord, setNewWord] = useState('');
    const [newCategory, setNewCategory] = useState('ولد');
    const [newLetter, setNewLetter] = useState('');

    const ARABIC_LETTERS = [
        "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
        "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
        "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
    ];

    const fetchWords = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/dictionary?category=${category}&letter=${letter}&page=${page}&limit=50`);
            setWords(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch words', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dictionary/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const addWord = async (e) => {
        e.preventDefault();
        if (!newWord) return;
        try {
            const targetLetter = newLetter || newWord.trim().charAt(0);
            await api.post('/admin/dictionary', {
                word: newWord,
                category: newCategory,
                letter: targetLetter
            });
            setNewWord('');
            setNewLetter('');
            fetchWords();
            fetchStats();
        } catch (error) {
            alert('Failed to add word');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            if (!confirm('Import words from ' + file.name + '?')) {
                e.target.value = null;
                return;
            }

            setLoading(true);
            const response = await api.post('/admin/dictionary/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(`Import Successful!\nAdded: ${response.data.added}\nIgnored (Duplicates): ${response.data.ignored}`);
            fetchWords();
            fetchStats();
        } catch (error) {
            console.error('Import failed', error);
            alert('Import Failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    const deleteWord = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/admin/dictionary/${id}`);
            fetchWords();
            fetchStats();
        } catch (error) {
            alert('Failed to delete word');
        }
    };

    useEffect(() => {
        setPage(1);
    }, [category, letter]);

    useEffect(() => {
        fetchWords();
    }, [category, letter, page]);

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Dictionary Manager</h1>
                    <p className="text-gray-500 mt-1">Manage accepted words and categories</p>
                </div>
            </div>

            {/* Stats Toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors"
                >
                    {showStats ? 'Hide Statistics' : 'Show Statistics'}
                </button>
            </div>

            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
                    {/* Category Stats */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Words by Category</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-4 py-2">Category</th>
                                        <th className="px-4 py-2 text-right">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.byCategory.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-700">{item.category}</td>
                                            <td className="px-4 py-2 text-sm font-bold text-purple-600 text-right">{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Letter Stats */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Words by Letter</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {stats.byLetter.map((item, index) => (
                                <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                                    <span className="text-lg font-bold text-gray-800">{item.letter}</span>
                                    <span className="text-xs font-bold text-purple-600">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Add New Word Card */}
                <div className="card h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="text-purple-600" size={20} /> Add New Word
                    </h3>
                    <form onSubmit={addWord} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-500 mb-1 block">Word</label>
                            <input
                                type="text"
                                placeholder="Arabic Word"
                                className="input"
                                value={newWord}
                                onChange={e => setNewWord(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-bold text-gray-500 mb-1 block">Category</label>
                                <select
                                    className="input"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                >
                                    <option value="ولد">ولد</option>
                                    <option value="بنت">بنت</option>
                                    <option value="حيوان">حيوان</option>
                                    <option value="جماد">جماد</option>
                                    <option value="نبات">نبات</option>
                                    <option value="بلد">بلد</option>
                                    <option value="شخصية مشهورة">شخصية مشهورة</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-500 mb-1 block">Letter</label>
                                <select
                                    className="input"
                                    value={newLetter}
                                    onChange={e => setNewLetter(e.target.value)}
                                >
                                    <option value="">(Auto)</option>
                                    {ARABIC_LETTERS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary justify-center mt-2">
                            Add Word
                        </button>
                    </form>
                </div>

                {/* Import Excel Card */}
                <div className="card h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Upload className="text-green-600" size={20} /> Import Excel
                    </h3>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-500">
                            Upload .xlsx file with columns: <b>word</b>, category, letter
                        </p>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-green-50 file:text-green-700
                                hover:file:bg-green-100"
                        />
                    </div>
                </div>

                {/* Filters & List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="card p-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="input pl-10"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="ولد">ولد</option>
                                <option value="بنت">بنت</option>
                                <option value="حيوان">حيوان</option>
                                <option value="جماد">جماد</option>
                                <option value="نبات">نبات</option>
                                <option value="بلد">بلد</option>
                                <option value="شخصية مشهورة">شخصية مشهورة</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-40">
                            <select
                                className="input"
                                value={letter}
                                onChange={e => setLetter(e.target.value)}
                            >
                                <option value="">All Letters</option>
                                {ARABIC_LETTERS.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card p-0 overflow-hidden flex-1">
                        <div className="table-container">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading dictionary...</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Word</th>
                                            <th>Category</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {words.length > 0 ? words.map(w => (
                                            <tr key={w.id}>
                                                <td className="text-gray-400">#{w.id}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                                                            {w.letter || w.word.charAt(0)}
                                                        </span>
                                                        <span className="font-bold text-gray-700">{w.word}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                                                        {w.category}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => deleteWord(w.id)}
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-8 text-gray-400">No words found match your filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-4 bg-gray-50">
                                <button
                                    className="btn btn-secondary text-sm py-1 px-3"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-bold text-gray-600">Page {page} of {totalPages}</span>
                                <button
                                    className="btn btn-secondary text-sm py-1 px-3"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dictionary;
