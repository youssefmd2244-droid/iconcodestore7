import React, { useState, useEffect } from 'react';
import { StoreData, Product, StoreSettings } from './types';
import { INITIAL_DATA } from './constants';
import StoreFront from './components/StoreFront';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  // 1. الحالة الأساسية للبيانات (تبدأ من التخزين المحلي أو الثوابت)
  const [data, setData] = useState<StoreData>(() => {
    const saved = localStorage.getItem('icon_code_pro_v3');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [view, setView] = useState<'store' | 'admin'>('store');

  // إعدادات المستودع
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";

  // --- ⚡ نظام التحديث اللحظي (فحص كل 3 ثوانٍ) ---
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // نستخدم رابط الـ Raw مع توقيت متغير لكسر الكاش فوراً وضمان السرعة
        const response = await fetch(
          `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}?t=${new Date().getTime()}`
        );
        
        if (response.ok) {
          const text = await response.text();
          // استخراج المصفوفة INITIAL_DATA من النص
          const jsonMatch = text.match(/export const INITIAL_DATA: StoreData = ([\s\S]*?);/);
          
          if (jsonMatch && jsonMatch[1]) {
            const latestData = JSON.parse(jsonMatch[1]);
            
            // مقارنة ذكية: التحديث فقط إذا وجد تغيير فعلي
            setData(prevData => {
              if (JSON.stringify(prevData) !== JSON.stringify(latestData)) {
                console.log("⚡ تم جلب تحديث جديد للمنتجات!");
                return latestData;
              }
              return prevData;
            });
            localStorage.setItem('icon_code_pro_v3', JSON.stringify(latestData));
          }
        }
      } catch (err) {
        // فحص صامت في الخلفية لضمان استمرار العمل
      }
    };

    fetchLatestData(); // جلب البيانات فور فتح الموقع

    // ضبط العداد ليفحص كل 3 ثوانٍ (سرعة ممتازة وآمنة)
    const interval = setInterval(fetchLatestData, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 📤 وظيفة المزامنة مع GitHub عند التعديل ---
  const syncToGitHub = async (updatedData: StoreData) => {
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      if (!GITHUB_TOKEN) {
        throw new Error("⚠️ التوكن (Token) غير موجود في إعدادات Vercel.");
      }

      // جلب الـ SHA الحالي للملف للتمكن من تحديثه
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) throw new Error("فشل الاتصال بـ GitHub API");
      
      const fileInfo = await res.json();
      
      // بناء محتوى الملف الجديد (كلمة سرك 2007 ثابتة هنا)
      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "⚡ تحديث لحظي للمتجر",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        alert("✅ تم الحفظ بنجاح! سيظهر التغيير عند جميع الزوار خلال 3 ثوانٍ.");
      } else {
        throw new Error("فشل تحديث الملف على GitHub.");
      }
    } catch (err: any) {
      alert(`🛑 خطأ: ${err.message}`);
    }
  };

  // --- 🎨 تحديث الثيم والألوان لحظياً ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.settings.primaryColor);
    root.style.setProperty('--secondary-color', data.settings.secondaryColor);
    root.style.setProperty('--accent-color', data.settings.accentColor);
    root.style.setProperty('--bg-color', data.settings.bgColor);
  }, [data]);

  // معالج تغيير البيانات
  const handleDataChange = (newData: StoreData) => {
    setData(newData);
    syncToGitHub(newData);
  };

  return (
    <div className="min-h-screen">
      {view === 'store' ? (
        <StoreFront data={data} goToAdmin={() => setView('admin')} />
      ) : (
        <ControlPanel 
          data={data} 
          goBack={() => setView('store')}
          onUpdateSettings={(s) => handleDataChange({...data, settings: s})}
          onAddCategory={(n, i) => handleDataChange({...data, categories: [...data.categories, {name: n, icon: i}]})}
          onRemoveCategory={(n) => handleDataChange({...data, categories: data.categories.filter(c => c.name !== n)})}
          onAddProduct={(p) => handleDataChange({...data, products: [...data.products, p]})}
          onDeleteProduct={(id) => handleDataChange({...data, products: data.products.filter(p => p.id !== id)})}
          onUpdateProduct={(upd) => handleDataChange({...data, products: data.products.map(p => p.id === upd.id ? upd : p)})}
        />
      )}
    </div>
  );
};

export default App;
