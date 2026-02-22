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

  // --- إعدادات GitHub API ---
  // تم تعديل السطر ده عشان يقرأ التوكن من Vercel بشكل آمن
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; 
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";

  const syncToGitHub = async (updatedData: StoreData) => {
    try {
      // التأكد من وجود التوكن قبل المحاولة
      if (!GITHUB_TOKEN) {
        alert("🛑 خطأ: التوكن غير موجود في إعدادات Vercel!");
        return;
      }

      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert("❌ فشل الوصول للملف: " + (errorData.message || "Bad credentials"));
        return;
      }
      
      const fileInfo = await res.json();

      // الباسورد المطلوب 20042007
      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "تحديث تلقائي من لوحة التحكم",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        alert("✅ تم الحفظ في GitHub بنجاح! التعديلات ستظهر للجميع خلال دقيقة.");
      } else {
        const errorUpdate = await updateRes.json();
        alert("⚠️ فشل التحديث: " + errorUpdate.message);
      }
    } catch (err) {
      alert("🛑 خطأ غير متوقع: " + err);
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel('store_updates');
    channel.onmessage = (event) => {
      if (event.data) setData(event.data);
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    localStorage.setItem('icon_code_pro_v3', JSON.stringify(data));
    const channel = new BroadcastChannel('store_updates');
    channel.postMessage(data);
    channel.close();

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
