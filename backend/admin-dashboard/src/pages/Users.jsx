import React, { useEffect, useState } from 'react';
import api from '../api';
import { Edit2, Trash2, Plus, X, Save } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user',
        wins: 0,
        losses: 0,
        total_score: 0
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.post(`/admin/users/${id}/status`, { is_active: !currentStatus });
            fetchUsers();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', role: 'user', wins: 0, losses: 0, total_score: 0 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email || '',
            password: '', // Leave blank to keep existing
            role: user.role,
            wins: user.wins,
            losses: user.losses,
            total_score: user.total_score
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Operation failed');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>User Management</h1>
                <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Stats (W/L)</th>
                            <th>Total Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: user.role === 'admin' ? '#fee2e2' : '#e0e7ff',
                                        color: user.role === 'admin' ? '#991b1b' : '#3730a3',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.wins} / {user.losses}</td>
                                <td>{user.total_score}</td>
                                <td>
                                    <span style={{
                                        color: user.is_active ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.is_active ? 'Active' : 'Banned'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenEdit(user)}
                                            style={{ color: '#3b82f6' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                        {user.role !== 'admin' && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => toggleStatus(user.id, user.is_active)}
                                                style={{ color: user.is_active ? '#ef4444' : '#10b981' }}
                                            >
                                                {user.is_active ? <Trash2 size={18} /> : <Save size={18} />}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password {editingUser && '(Leave blank to stay same)'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {editingUser && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Wins</label>
                                        <input
                                            type="number"
                                            value={formData.wins}
                                            onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Losses</label>
                                        <input
                                            type="number"
                                            value={formData.losses}
                                            onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Score</label>
                                        <input
                                            type="number"
                                            value={formData.total_score}
                                            onChange={(e) => setFormData({ ...formData, total_score: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
