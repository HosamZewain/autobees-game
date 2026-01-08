import React from 'react';
import SEO from '../components/SEO';

const Privacy = () => {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl" dir="rtl">
            <SEO title="سياسة الخصوصية" description="سياسة الخصوصية وحماية البيانات في لعبة أوتوبيس كومبليت." />
            <h1 className="text-4xl font-black mb-8">سياسة الخصوصية 🛡️</h1>
            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed space-y-6">
                <p>نحن نحترم خصوصيتك ونسعى لحماية بياناتك الشخصية:</p>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">1. البيانات التي نجمعها</h2>
                    <p>نجمع فقط البيانات الضرورية لتشغيل حسابك، مثل اسم المستخدم والبريد الإلكتروني وإحصائيات اللعب.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">2. كيف نستخدم بياناتك</h2>
                    <p>تُستخدم بياناتك لتحسين تجربة اللعب وعرض لوحة المتصدرين وتوفير ميزات اللعب الجماعي.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">3. حماية البيانات</h2>
                    <p>نستخدم تقنيات تشفير حديثة لضمان أمن بياناتك ومنع الوصول غير المصرح به.</p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
