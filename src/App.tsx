import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Star, 
  ShoppingCart, 
  AlertCircle,
  TrendingDown,
  ArrowLeft
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface AnalysisResult {
  productName: string;
  summary: string;
  rating: number;
  pros: string[];
  cons: string[];
  verdict: string;
  estimatedPrice: string;
  alternatives: { name: string; reason: string }[];
}

// --- Gemini Setup ---
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("عذراً، لم يتم العثور على مفتاح API الخاص بـ Gemini. يرجى إضافته في الإعدادات.");
  }
  return new GoogleGenAI({ apiKey });
};

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = getGenAIClient();
      
      const prompt = `أنت خبير في تقييم المنتجات وتحليل السوق. قم بتحليل المنتج التالي بموضوعية ودقة.
المنتج المُراد تحليله: "${query.trim()}"

يجب أن يكون ردك بصيغة JSON صحيحة فقط (Valid JSON) وبدون أي نصوص إضافية، بحيث يحتوي على الهيكل التالي. تأكد من أن يكون الرد JSON فقط بدون أي علامات تنسيق مثل \`\`\`json.
{
  "productName": "الاسم الدقيق للمنتج",
  "summary": "نظرة عامة مختصرة في سطرين عن المنتج ولمن يصلح",
  "rating": 8.5,
  "pros": ["ميزة 1", "ميزة 2", "ميزة 3"],
  "cons": ["عيب 1", "عيب 2"],
  "verdict": "توصية نهائية وقرار حاسم في جملة واحدة",
  "estimatedPrice": "السعر التقريبي (إذا لم تعرف، اكتب 'غير معروف')",
  "alternatives": [
     { "name": "اسم منتج بمواصفات مشابهة", "reason": "لماذا يعتبر بديلاً جيداً" }
  ]
}

تأكد من أن جميع النصوص باللغة العربية الفصحى الواضحة والسهلة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
        }
      });

      let responseText = response.text || '';
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      try {
        const parsedData = JSON.parse(responseText) as AnalysisResult;
        setResult(parsedData);
      } catch (parseError) {
        console.error("Failed to parse JSON", responseText);
        throw new Error("حدث خطأ أثناء محاولة فهم رد الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
      }

    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const shadowSolid = "shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]";
  const shadowSolidSm = "shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">S</div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 underline decoration-blue-500 underline-offset-4">فحص ذكي</h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wider text-slate-500">
          <a href="#" className="text-blue-600">الرئيسية</a>
          <a href="#" className="hover:text-slate-800 transition-colors">السجل</a>
          <a href="#" className="hover:text-slate-800 transition-colors">المقارنة</a>
        </nav>
        <button className="hidden sm:block px-5 py-2 bg-slate-900 text-white border-2 border-slate-900 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors">
          تسجيل الدخول
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow auto-rows-max">
        
        {/* Search & Scanner Card */}
        <div className={cn(
          "bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-center transition-all duration-500",
          shadowSolid,
          result ? "col-span-1 md:col-span-12 lg:col-span-8 lg:row-span-2" : "col-span-1 md:col-span-12 lg:col-span-8 lg:row-span-4 min-h-[400px]"
        )}>
          {!result && <h2 className="text-3xl md:text-4xl font-black mb-4">افحص أي منتج فوراً</h2>}
          {!result && <p className="text-slate-500 mb-8 max-w-md leading-relaxed font-medium">استخدم تقنية الذكاء الاصطناعي لتحليل المكونات، السعر، وتقييمات السوق الحقيقية في ثوانٍ معدودة.</p>}
          
          <form onSubmit={handleAnalyze} className="relative w-full">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="أدخل اسم المنتج، أو ماركة، أو الرمز الشريطي..." 
              className="w-full pl-4 pr-16 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute left-2 top-2 bottom-2 px-6 sm:px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-75 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center border-2 border-transparent disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 border-2 border-red-200 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {!result && !error && (
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <span>شائع:</span>
              <button type="button" onClick={() => setQuery('آيفون 15')} className="hover:text-blue-600 transition-colors">آيفون 15</button>
              <span>•</span>
              <button type="button" onClick={() => setQuery('عسل مانوكا')} className="hover:text-blue-600 transition-colors">عسل مانوكا</button>
              <span>•</span>
              <button type="button" onClick={() => setQuery('مكملات غذائية')} className="hover:text-blue-600 transition-colors">مكملات غذائية</button>
            </div>
          )}
        </div>

        {/* Placeholder / Empty States shown when NO result is present */}
        {!result && (
          <>
            {/* Quick Stats Placeholder */}
            <div className={cn("col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-2 bg-blue-600 border-2 border-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between", shadowSolid)}>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold uppercase opacity-80 tracking-widest">إحصائيات اليوم</span>
                <div className="w-8 h-8 border-2 border-white/20 rounded-full bg-white/10 flex items-center justify-center">📈</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-1 drop-shadow-md">+٢,٤٠٠</div>
                <div className="text-sm font-bold opacity-90">عملية تحليل تمت اليوم</div>
              </div>
            </div>

            {/* History Placeholder */}
            <div className="col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-4 bg-white border-2 border-slate-200 rounded-3xl p-6 overflow-hidden">
              <h3 className="text-lg font-black mb-6 flex justify-between items-center border-b-2 border-slate-100 pb-4">
                <span>التحليلات الأخيرة</span>
                <span className="text-blue-600 text-sm cursor-pointer hover:underline">الكل</span>
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'غسالة سامسونج', time: 'قبل ٥ دقائق', score: '٩٢٪', bg: 'bg-orange-100', color: 'text-green-600' },
                  { title: 'سماعات سوني', time: 'قبل ١٥ دقيقة', score: '٧٥٪', bg: 'bg-purple-100', color: 'text-yellow-600', opacity: 'opacity-60' },
                  { title: 'شاحن أنكر', time: 'قبل ساعة', score: '٤٠٪', bg: 'bg-green-100', color: 'text-red-600', opacity: 'opacity-40' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors ${item.opacity || ''}`}>
                    <div className={`w-12 h-12 ${item.bg} rounded-xl border border-slate-200 shrink-0`}></div>
                    <div className="flex-grow">
                      <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">{item.title}</div>
                      <div className="text-xs font-semibold text-slate-400">{item.time}</div>
                    </div>
                    <div className={`${item.color} font-black`}>{item.score}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Market Insights Placeholder */}
            <div className={cn("hidden lg:flex col-span-1 lg:col-span-8 lg:row-span-2 bg-slate-900 border-2 border-slate-900 text-white rounded-3xl p-8 flex-col justify-between", shadowSolid)}>
               <div className="space-y-4 max-w-xl">
                 <div className="inline-block px-3 py-1 bg-green-500 border border-green-400 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-wider">تلميح ذكي</div>
                 <h3 className="text-2xl font-black">جاهز للتحليل؟</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">أدخل أي منتج في شريط البحث أعلاه ودع الذكاء الاصطناعي يقوم بالباقي. سنقوم بجلب الأسعار وإعطائك نظرة شاملة عن العيوب والمميزات.</p>
               </div>
            </div>
          </>
        )}

        {/* Results Area (Replacing placeholders when data arrives) */}
        {result && (
          <AnimatePresence mode="popLayout">
            {/* Overview / Verdict block */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn("col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-5 bg-slate-900 text-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between", shadowSolid)}
            >
              <div className="space-y-4">
                 <div className="inline-block px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-400">
                   نظرة عامة
                 </div>
                 <h3 className="text-3xl font-black leading-tight text-white mb-2">{result.productName}</h3>
                 <p className="text-slate-300 font-medium leading-relaxed">{result.summary}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
                <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">القرار النهائي</h4>
                  <p className="text-lg font-bold text-white">{result.verdict}</p>
                </div>
                
                <div className="flex gap-2 items-center text-sm font-bold bg-white/10 p-4 rounded-2xl border border-white/5">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">السعر التقريبي:</span>
                  <span className="text-white ml-auto tracking-wide">{result.estimatedPrice}</span>
                </div>
              </div>
            </motion.div>

            {/* Score Block */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className={cn("col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-2 bg-blue-600 text-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col justify-between", shadowSolid)}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold uppercase tracking-widest text-blue-100">تقييم الجودة</span>
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center font-black">⭐</div>
              </div>
              <div className="flex items-end justify-between mt-6">
                <div>
                  <div className="text-6xl font-black mb-1 drop-shadow-md">
                    {result.rating}<span className="text-3xl text-blue-200">/10</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-300 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 drop-shadow-sm", i < Math.round(result.rating / 2) ? "fill-current" : "opacity-30")} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pros & Cons - Pros Block */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className={cn("col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-3 bg-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col max-h-[400px] overflow-y-auto", shadowSolidSm)}
            >
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                المميزات الإيجابية
              </h3>
              <ul className="space-y-4 flex-grow">
                {result.pros.map((pro, index) => (
                  <li key={index} className="flex gap-3 text-slate-700 font-bold bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2 block"></span>
                    <span className="leading-relaxed">{pro}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pros & Cons - Cons Block */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className={cn("col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-3 bg-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col max-h-[400px] overflow-y-auto", shadowSolidSm)}
            >
               <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-3">
                <XCircle className="w-6 h-6 text-red-500" />
                أبرز العيوب
              </h3>
              <ul className="space-y-4 flex-grow">
                {result.cons.map((con, index) => (
                  <li key={index} className="flex gap-3 text-slate-700 font-bold bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2 block"></span>
                    <span className="leading-relaxed">{con}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Alternatives Block */}
            {result.alternatives && result.alternatives.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                className={cn("col-span-1 lg:col-span-8 lg:row-span-2 bg-white border-2 border-slate-200 hover:border-slate-400 transition-colors rounded-3xl p-6 md:p-8")}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">البدائل المقترحة</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="p-4 border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors">
                      <h4 className="font-black text-slate-800 mb-1">{alt.name}</h4>
                      <p className="text-sm font-semibold text-slate-500 leading-relaxed">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* Footer Mini */}
      <footer className="mt-8 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t-2 border-slate-200 pt-6">
        <div>جميع الحقوق محفوظة © ٢٠٢٦ منصة فحص ذكي</div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-slate-600">سياسة الخصوصية</span>
          <span className="cursor-pointer hover:text-slate-600">اتصل بنا</span>
        </div>
      </footer>
    </div>
  );
}
