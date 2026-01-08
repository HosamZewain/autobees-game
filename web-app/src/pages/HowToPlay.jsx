import React from 'react';
import { HelpCircle, Target, Award, List, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const HowToPlay = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <HelpCircle className="text-blue-500" />,
            title: "ما هي لعبة أوتوبيس كومبليت؟",
            content: "أوتوبيس كومبليت (أو إنسان حيوان جماد) هي لعبة كلمات عربية كلاسيكية شهيرة. الهدف هو ملء فئات مختلفة بكلمات تبدأ بحرف محدد بأسرع ما يمكن."
        },
        {
            icon: <Target className="text-red-500" />,
            title: "كيف تبدأ اللعبة؟",
            content: "عند بدء الجوله، يتم اختيار حرف عشوائي. يجب عليك كتابة كلمات تبدأ بهذا الحرف في كل من الفئات المحددة (مثل: اسم إنسان، حيوان، بلد، إلخ)."
        },
        {
            icon: <Award className="text-yellow-500" />,
            title: "نظام النقاط",
            content: "تحصل على 10 نقاط لكل إجابة صحيحة وفريدة. إذا تشابهت إجابتك مع لاعب آخر، تحصل على 5 نقاط فقط. إذا كانت الإجابة خاطئة أو فارغة، تحصل على 0."
        },
        {
            icon: <Zap className="text-purple-500" />,
            title: "متى تنتهي الجولة؟",
            content: "في اللعب الفردي، تنتهي الجولة بانتهاء الوقت (60 ثانية). في اللعب الجماعي، تنتهي الجولة عندما يضغط أول لاعب ينهي جميع الفئات على زر 'إنهاء' أو بانتهاء الوقت."
        }
    ];

    const categories = [
        "إنسان (مثل: أحمد، أمل)",
        "حيوان (مثل: أسد، أرنب)",
        "نبات (مثل: أرز، أناناس)",
        "جماد (مثل: إبريق، أريكه)",
        "بلاد (مثل: ألمانيا، أمريكا)",
        "مهنة (مثل: أستاذ، أديب)"
    ];

    return (
        <div className="how-to-play-page container mx-auto px-4 py-10 max-w-4xl" dir="rtl">
            <SEO title="كيفية اللعب" description="تعرف على قواعد لعبة أوتوبيس كومبليت ونظام النقاط وكيفية الفوز." />

            <div className="flex items-center gap-4 mb-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="rotate-180" size={24} />
                </button>
                <h1 className="text-4xl font-black text-gray-800">كيفية اللعب 📖</h1>
            </div>

            <div className="grid gap-8 mb-16">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            {section.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{section.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{section.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <List size={28} /> الفئات المطلوبة
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {categories.map((cat, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">{index + 1}</span>
                            <span className="font-medium">{cat}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-2xl font-black text-gray-800 mb-6">جاهز للتحدي؟</h2>
                <button
                    onClick={() => navigate('/play')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-purple-100 transition-all hover:-translate-y-1"
                >
                    ابدأ اللعب الآن
                </button>
            </div>
        </div>
    );
};

export default HowToPlay;
