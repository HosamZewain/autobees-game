import React, { useState } from 'react';
import axios from 'axios';
import { Send, Mail, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Contact() {
    const { API_URL } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        contact_info: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post(`${API_URL}/contact`, formData);
            setStatus('success');
            setFormData({ name: '', contact_info: '', message: '' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="contact-container container">
            <SEO title="تواصل معنا" description="نحن هنا للمساعدة! أرسل لنا استفسارك أو اقتراحك أو بلغ عن مشكلة." />
            <div className="contact-card">
                <div className="contact-header">
                    <h1>تواصل معنا 📬</h1>
                    <p>نحن هنا للمساعدة! أرسل لنا استفسارك أو اقتراحك.</p>
                </div>

                {status === 'success' ? (
                    <div className="success-message">
                        <CheckCircle size={64} className="success-icon" />
                        <h2>تم الإرسال بنجاح!</h2>
                        <p>شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.</p>
                        <button onClick={() => setStatus('idle')} className="btn btn-primary">إرسال رسالة أخرى</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label>الاسم الكامل</label>
                            <div className="input-wrapper">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    required
                                    placeholder="أدخل اسمك..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>معلومات التواصل (واتساب أو إيميل)</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="text"
                                    required
                                    placeholder="رقم هاتفك أو بريدك الإلكتروني..."
                                    value={formData.contact_info}
                                    onChange={e => setFormData({ ...formData, contact_info: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>رسالتك</label>
                            <textarea
                                required
                                rows="5"
                                placeholder="كيف يمكننا مساعدتك؟"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            ></textarea>
                        </div>

                        {status === 'error' && (
                            <div className="error-alert">
                                <AlertCircle size={20} />
                                <span>حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.</span>
                            </div>
                        )}

                        <button type="submit" disabled={status === 'sending'} className="btn btn-primary btn-lg btn-block">
                            {status === 'sending' ? 'جاري الإرسال...' : 'إرسال الرسالة'} <Send size={20} />
                        </button>
                    </form>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .contact-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 40px 20px 100px; /* Added more bottom padding for footer space */
        }
        .contact-card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
            width: 100%;
            max-width: 600px;
            border: 1px solid rgba(0,0,0,0.05);
        }
        .contact-header { text-align: center; margin-bottom: 30px; }
        .contact-header h1 { font-size: 2rem; color: #1f2937; margin-bottom: 10px; }
        .contact-header p { color: #6b7280; font-size: 1.1rem; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        
        input, textarea {
            width: 100%;
            padding: 14px 45px 14px 15px; /* Swapped padding for RTL: 45px on the right for icon */
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.2s;
            outline: none;
            direction: rtl;
        }
        input:focus, textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
        textarea { padding: 15px; resize: vertical; }

        .btn-block { width: 100%; justify-content: center; margin-top: 10px; }
        
        .success-message { text-align: center; padding: 40px 0; animation: fadeIn 0.5s ease; }
        .success-icon { color: #10b981; margin-bottom: 20px; }
        .success-message h2 { font-size: 1.8rem; color: #1f2937; margin-bottom: 10px; }
        .success-message p { color: #6b7280; margin-bottom: 30px; }

        .error-alert {
            background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 10px;
            display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
        </div>
    );
}
