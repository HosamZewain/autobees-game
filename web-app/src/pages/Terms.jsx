import React from 'react';
import SEO from '../components/SEO';

const Terms = () => {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl" dir="rtl">
            <SEO title="الشروط والأحكام" description="الشروط والأحكام الخاصة باستخدام لعبة أوتوبيس كومبليت." />
            <h1 className="text-4xl font-black mb-8">الشروط والأحكام ⚖️</h1>
            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed space-y-6">
                <p>أهلاً بك في أوتوبيس كومبليت. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط التالية:</p>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">1. الاستخدام المقبول</h2>
                    <p>يجب استخدام اللعبة بطريقة قانونية وأخلاقية. يُمنع الغش أو استخدام برامج آلية للإجابة.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">2. الحسابات</h2>
                    <p>أنت مسؤول عن الحفاظ على سرية معلومات حسابك ونشاطك داخل اللعبة.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">3. المحتوى</h2>
                    <p>جميع حقوق الملكية الفكرية للعبة وتصميمها تعود لمنصة أوتوبيس كومبليت.</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
