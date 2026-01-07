import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, Plus } from 'lucide-react';

const Dictionary = () => {
    const [words, setWords] = useState([]);
    const [category, setCategory] = useState('');
    const [letter, setLetter] = useState(''); // Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [newWord, setNewWord] = useState('');
    const [newCategory, setNewCategory] = useState('ولد');
    const [newLetter, setNewLetter] = useState(''); // Add form

    const ARABIC_LETTERS = [
        "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
        "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
        "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
    ];

    const fetchWords = async () => {
        try {
            const response = await api.get(`/admin/dictionary?category=${category}&letter=${letter}&page=${page}&limit=50`);
            console.log('API Response:', response.data);
            setWords(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch words', error);
        }
    };

    const addWord = async (e) => {
        e.preventDefault();
        if (!newWord) return;
        try {
            // Default letter to first char if not provided
            const targetLetter = newLetter || newWord.trim().charAt(0);
            await api.post('/admin/dictionary', {
                word: newWord,
                category: newCategory,
                letter: targetLetter
            });
            setNewWord('');
            setNewLetter('');
            fetchWords();
        } catch (error) {
            alert('Failed to add word');
        }
    };

    const deleteWord = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/admin/dictionary/${id}`);
            fetchWords();
        } catch (error) {
            alert('Failed to delete word');
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [category, letter]);

    useEffect(() => {
        fetchWords();
    }, [category, letter, page]);

    return (
        <div>
            <div className="page-header">
                <h1>Dictionary Manager</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '200px' }}>
                        <option value="">All Categories</option>
                        <option value="ولد">ولد</option>
                        <option value="بنت">بنت</option>
                        <option value="حيوان">حيوان</option>
                        <option value="جماد">جماد</option>
                        <option value="نبات">نبات</option>
                        <option value="بلد">بلد</option>
                        <option value="شخصية مشهورة">شخصية مشهورة</option>
                    </select>

                    <select value={letter} onChange={e => setLetter(e.target.value)} style={{ width: '100px' }}>
                        <option value="">All Letters</option>
                        {ARABIC_LETTERS.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card">
                <h3>Add New Word</h3>
                <form onSubmit={addWord} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Arabic Word"
                        value={newWord}
                        onChange={e => setNewWord(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    />

                    <select
                        value={newLetter}
                        onChange={e => setNewLetter(e.target.value)}
                        style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    >
                        <option value="">(Auto-detect)</option>
                        {ARABIC_LETTERS.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>

                    <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }}
                    >
                        <option value="ولد">ولد</option>
                        <option value="بنت">بنت</option>
                        <option value="حيوان">حيوان</option>
                        <option value="جماد">جماد</option>
                        <option value="نبات">نبات</option>
                        <option value="بلد">بلد</option>
                        <option value="شخصية مشهورة">شخصية مشهورة</option>
                    </select>
                    <button type="submit" className="btn btn-primary"><Plus size={18} /> Add</button>
                </form>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Letter</th>
                            <th>Word</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {words.map(w => (
                            <tr key={w.id}>
                                <td>{w.id}</td>
                                <td><span className="badge">{w.letter || w.word.charAt(0)}</span></td>
                                <td>{w.word}</td>
                                <td>{w.category}</td>
                                <td>
                                    <button onClick={() => deleteWord(w.id)} className="btn" style={{ color: 'red' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dictionary;


