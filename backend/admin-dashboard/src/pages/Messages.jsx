import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/admin/messages');
            setMessages(res.data);
        } catch (err) {
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id, currentStatus) => {
        if (currentStatus === 'read') return;
        try {
            await api.put(`/admin/messages/${id}/status`, { status: 'read' });
            toast.success('Message marked as read');
            fetchMessages();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/admin/messages/${id}`);
            toast.success('Message deleted');
            setMessages(messages.filter(m => m.id !== id));
        } catch (err) {
            toast.error('Failed to delete message');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading messages...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Mail /> Messages ({messages.length})
                </h1>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-lg border">No messages found.</div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`bg-white p-4 rounded-lg shadow-sm border-r-4 ${msg.status === 'new' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} transition-all hover:shadow-md`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-800">{msg.name}</h3>
                                        {msg.status === 'new' && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                <Clock size={12} /> New
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2 font-mono bg-gray-50 px-2 py-1 inline-block rounded">{msg.contact_info}</div>
                                    <p className="text-gray-700 whitespace-pre-wrap mt-2">{msg.message}</p>
                                    <div className="text-xs text-gray-400 mt-4">{new Date(msg.created_at).toLocaleString()}</div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {msg.status === 'new' && (
                                        <button
                                            onClick={() => markAsRead(msg.id, msg.status)}
                                            className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
                                            title="Mark as Read"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteMessage(msg.id)}
                                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
                                        title="Delete Message"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <ToastContainer />
        </div>
    );
}
