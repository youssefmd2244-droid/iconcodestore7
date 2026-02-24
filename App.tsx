import React, { useState, useEffect } from 'react';
import { StoreData, Product, StoreSettings } from './types';
import { INITIAL_DATA } from './constants';
import StoreFront from './components/StoreFront';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [data, setData] = useState<StoreData>(() => {
    const saved = localStorage.getItem('icon_code_pro_v3');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [view, setView] = useState<'store' | 'admin'>('store');

  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";

  // --- نظام التحديث اللحظي الخارق (تحديث كل ثانيتين بدون حظر) ---
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // نستخدم رابط الـ Raw مع Timestamp عالي الدقة لكسر الكاش فوراً
        const response = await fetch(
          `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}?t=${new Date().getTime()}`
        );
        
        if (response.ok) {
          const text = await response.text();
          const jsonMatch = text.match(/export const INITIAL_DATA: StoreData = ([\s\S]*?);/);
          
          if (jsonMatch && jsonMatch[1]) {
            const latestData = JSON.parse(jsonMatch[1]);
            
            // مقارنة سريعة: لو البيانات مختلفة، حدث الواجهة فوراً
            setData(prevData => {
              if (JSON.stringify(prevData) !== JSON.stringify(latestData)) {
                console.log("⚡ تحديث لحظي للبيانات...");
                return latestData;
              }
              return prevData;
            });
            localStorage.setItem('icon_code_pro_v3', JSON.stringify(latestData));
          }
        }
      } catch (err) {
        // فحص صامت
      }
    };

    // فحص أولي
    fetchLatestData();

    // فحص كل ثانيتين (سرعة البرق وآمنة تماماً)
    const interval = setInterval(fetchLatestData, 2000);
    return () => clearInterval(interval);
  }, []);

  const syncToGitHub = async (updatedData: StoreData) => {
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      if (!GITHUB_TOKEN) {
        throw new Error("العيب: التوكن غير موجود في Vercel");
      }

      // جلب الـ SHA الحالي
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) throw new Error("فشل الاتصال بـ GitHub API");
      
      const fileInfo = await res.json();
      
      // المحتوى الجديد (كلمة سرك 2007)
      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "⚡ تحديث لحظي",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        alert("✅ تم الحفظ! التعديلات ستظهر للجميع الآن تلقائياً.");
      } else {
        throw new Error("فشل رفع البيانات لـ GitHub");
      }
    } catch (err: any) {
      alert(`🛑 خطأ: ${err.message}`);
    }
  };

  useEffect(() => {
    // تحديث ألوان الثيم فورياً عند أي تغيير
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.settings.primaryColor);
    root.style.setProperty('--secondary-color', data.settings.secondaryColor);
    root.style.setProperty('--accent-color', data.settings.accentColor);
    root.style.setProperty('--bg-color', data.settings.bgColor);
  }, [data]);

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
        
