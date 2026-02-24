import React, { useState, useEffect, useRef } from 'react';
import { StoreData, Product, StoreSettings } from './types';
import { INITIAL_DATA } from './constants';
import StoreFront from './components/StoreFront';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  // 1. نظام التحميل الفوري: استعادة البيانات من الذاكرة المحلية فوراً لسرعة البرق
  const [data, setData] = useState<StoreData>(() => {
    const saved = localStorage.getItem('icon_code_pro_v3');
    try {
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [view, setView] = useState<'store' | 'admin'>('store');
  
  // مرجع (Ref) لمنع حدوث "تعليق" أو تداخل أثناء عملية الرفع لـ GitHub
  const isSyncing = useRef(false);

  // إعدادات GitHub المستهدفة
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";

  // --- 🚀 محرك الجلب الدوري النفاث (Turbo Real-time Polling) ---
  useEffect(() => {
    const fetchLatestData = async () => {
      // إذا كان المستخدم يقوم بالتعديل حالياً، نوقف الجلب الدوري لمنع الكتابة فوق التعديلات الجديدة
      if (isSyncing.current) return;

      try {
        // نستخدم رابط الـ Raw مع Cache Buster (توقيت الملي ثانية) لإجبار السيرفر على إرسال أحدث نسخة فوراً
        const response = await fetch(
          `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}?t=${new Date().getTime()}`
        );
        
        if (response.ok) {
          const text = await response.text();
          // استخراج المصفوفة الأساسية للبيانات من ملف TypeScript
          const jsonMatch = text.match(/export const INITIAL_DATA: StoreData = ([\s\S]*?);/);
          
          if (jsonMatch && jsonMatch[1]) {
            const latestData = JSON.parse(jsonMatch[1]);
            
            // المقارنة الذكية: تحديث الواجهة فقط إذا وجد اختلاف حقيقي لتوفير موارد المتصفح
            const currentStr = JSON.stringify(data);
            const latestStr = JSON.stringify(latestData);
            
            if (currentStr !== latestStr) {
              console.log("🚀 تحديث بيانات خارجي مكتشف.. مزامنة فورية جارية.");
              setData(latestData);
              localStorage.setItem('icon_code_pro_v3', latestStr);
            }
          }
        }
      } catch (err) {
        console.log("فحص صامت قيد التشغيل...");
      }
    };

    // فحص كل ثانيتين (توازن مثالي بين السرعة القصوى وتجنب حظر GitHub)
    const interval = setInterval(fetchLatestData, 2000); 
    return () => clearInterval(interval);
  }, [data]);

  // --- 🛰️ نظام المزامنة السحابي الفوري (Instant Cloud Sync) ---
  const syncToGitHub = async (updatedData: StoreData) => {
    isSyncing.current = true; // تفعيل وضع الحماية
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      if (!GITHUB_TOKEN) {
        console.error("خطأ: التوكن غير موجود في متغيرات البيئة!");
        return;
      }

      // جلب الـ SHA (بصمة الملف الحالية) وهو أمر ضروري للتعديل على GitHub API
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) throw new Error("فشل في جلب SHA للملف");
      const fileInfo = await res.json();
      
      // بناء هيكل الملف البرمجي بالكامل مع كلمة سرك 20042007
      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      // عملية التحديث (PUT) في الخلفية
      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "🚀 Turbo Update: Instant Data Sync",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        console.log("✅ تمت المزامنة مع GitHub بنجاح.");
      }
    } catch (err: any) {
      console.error("🛑 فشل المزامنة:", err.message);
    } finally {
      // إيقاف الحماية بعد اكتمال العملية ليعود الجلب الدوري للعمل
      setTimeout(() => { isSyncing.current = false; }, 1000);
    }
  };

  // --- 🎨 نظام إدارة الألوان اللحظي (CSS Variables) ---
  useEffect(() => {
    const root = document.documentElement;
    const { settings: s } = data;
    root.style.setProperty('--primary-color', s.primaryColor);
    root.style.setProperty('--secondary-color', s.secondaryColor);
    root.style.setProperty('--accent-color', s.accentColor);
    root.style.setProperty('--bg-color', s.bgColor);
  }, [data]);

  // --- 🛠️ معالج البيانات "الطلقة" (Optimistic Change Handler) ---
  const handleDataChange = (newData: StoreData) => {
    // 1. تحديث الحالة في المتصفح فوراً (المستخدم يرى النتيجة في أجزاء من الثانية)
    setData(newData);
    // 2. حفظ في الذاكرة المحلية فوراً
    localStorage.setItem('icon_code_pro_v3', JSON.stringify(newData));
    // 3. إرسال لـ GitHub في "الخلفية" دون جعل المستخدم ينتظر التحميل
    syncToGitHub(newData);
  };

  return (
    <div className="min-h-screen transition-all duration-300" style={{ backgroundColor: data.settings.bgColor }}>
      {view === 'store' ? (
        <StoreFront 
          data={data} 
          goToAdmin={() => setView('admin')} 
        />
      ) : (
        <ControlPanel 
          data={data} 
          goBack={() => setView('store')}
          onUpdateSettings={(s) => handleDataChange({...data, settings: s})}
          onAddCategory={(n, i) => handleDataChange({...data, categories: [...data.categories, {name: n, icon: i}]})}
          onRemoveCategory={(n) => handleDataChange({...data, categories: data.categories.filter(c => c.name !== n)})}
          onAddProduct={(p) => handleDataChange({...data, products: [p, ...data.products]})} // المنتج الجديد يظهر في الأعلى فوراً
          onDeleteProduct={(id) => handleDataChange({...data, products: data.products.filter(p => p.id !== id)})}
          onUpdateProduct={(upd) => handleDataChange({...data, products: data.products.map(p => p.id === upd.id ? upd : p)})}
        />
      )}
    </div>
  );
};

export default App;
              
