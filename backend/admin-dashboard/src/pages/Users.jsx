import React, { useEffect, useState } from 'react';
import api from '../api';
import { Edit2, Trash2, Plus, X, Save, Ban, CheckCircle, Search } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.post(`/admin/users/${id}/status`, { is_active: !currentStatus });
            setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) return;

        try {
            await api.delete(`/admin/users/${user.id}`);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to delete user');
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
            password: '',
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

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage game players and administrators</p>
                </div>
                <button onClick={handleOpenCreate} className="btn btn-primary w-full md:w-auto">
                    <Plus size={18} /> Add New User
                </button>
            </div>

            <div className="card mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="table-container">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading users...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Stats (W/L)</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="text-gray-400">#{user.id}</td>
                                        <td>
                                            <div className="font-bold text-gray-800">{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 font-bold">{user.wins}W</span>
                                                <span className="text-gray-300">/</span>
                                                <span className="text-red-500 font-bold">{user.losses}L</span>
                                            </div>
                                        </td>
                                        <td className="font-mono font-bold">{user.total_score}</td>
                                        <td>
                                            <span className={`flex items-center gap-1 text-sm font-bold ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                                {user.is_active ? <CheckCircle size={14} /> : <Ban size={14} />}
                                                {user.is_active ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                                    onClick={() => handleOpenEdit(user)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                {user.role !== 'admin' && (
                                                    <>
                                                        <button
                                                            className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'hover:bg-orange-50 text-orange-600' : 'hover:bg-green-50 text-green-600'}`}
                                                            onClick={() => toggleStatus(user.id, user.is_active)}
                                                            title={user.is_active ? 'Ban User' : 'Activate User'}
                                                        >
                                                            {user.is_active ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                        </button>

                                                        <button
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                            onClick={() => handleDelete(user)}
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingUser ? 'Edit User' : 'Create User'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Role</label>
                                    <select
                                        className="input"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Password {editingUser && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {editingUser && (
                                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Wins</label>
                                        <input
                                            type="number"
                                            className="input text-center text-green-600 font-bold"
                                            value={formData.wins}
                                            onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Losses</label>
                                        <input
                                            type="number"
                                            className="input text-center text-red-500 font-bold"
                                            value={formData.losses}
                                            onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Total Score</label>
                                        <input
                                            type="number"
                                            className="input text-center text-purple-600 font-bold"
                                            value={formData.total_score}
                                            onChange={(e) => setFormData({ ...formData, total_score: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
