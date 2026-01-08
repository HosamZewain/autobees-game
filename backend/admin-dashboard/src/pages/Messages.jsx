import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Trash2, CheckCircle, Clock, User, AtSign, MessageSquare } from 'lucide-react';
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

    if (loading) return <div className="p-8 text-center text-gray-400">Loading messages...</div>;

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Inbox</h1>
                    <p className="text-gray-500 mt-1">User inquiries and contact form submissions</p>
                </div>
                <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold flex items-center gap-2">
                    <Mail size={18} /> {messages.length} Messages
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Mail size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Inbox is empty</h3>
                        <p className="text-gray-400">No messages found currently.</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`card p-6 flex flex-col md:flex-row gap-6 relative transition-all duration-200 border-l-4 ${msg.status === 'new' ? 'border-l-purple-500 shadow-purple-500/5' : 'border-l-transparent bg-gray-50/50'}`}>

                            {/* Meta Info */}
                            <div className="md:w-64 shrink-0 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 leading-tight">{msg.name}</h3>
                                        {msg.status === 'new' && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">New</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <AtSign size={14} className="text-gray-400" />
                                    {msg.contact_info}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-auto">
                                    <Clock size={12} />
                                    {new Date(msg.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {msg.message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 shrink-0 md:pl-2">
                                {msg.status === 'new' && (
                                    <button
                                        onClick={() => markAsRead(msg.id, msg.status)}
                                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                        title="Mark as Read"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors md:mt-auto"
                                    title="Delete Message"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <ToastContainer position="bottom-right" theme="light" />
        </div>
    );
}
