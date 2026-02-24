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
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";
  
  // --- نظام التحديث اللحظي التلقائي (بدون ريفريش) ---
  useEffect(() => {
    const fetchInstantData = async () => {
      try {
        // نستخدم التوقيت لكسر الكاش تماماً وجلب أحدث ملف من GitHub
        const response = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?t=${Date.now()}`
        );
        
        if (response.ok) {
          const fileData = await response.json();
          const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
          
          const jsonMatch = decodedContent.match(/export const INITIAL_DATA: StoreData = ([\s\S]*?);/);
          if (jsonMatch && jsonMatch[1]) {
            const latestData = JSON.parse(jsonMatch[1]);
            
            // مقارنة البيانات: إذا حدث تغيير فعلي، نحدث الواجهة فوراً
            setData(prevData => {
              if (JSON.stringify(prevData) !== JSON.stringify(latestData)) {
                console.log("تم اكتشاف تحديث جديد.. جاري التحديث اللحظي");
                return latestData;
              }
              return prevData;
            });
            localStorage.setItem('icon_code_pro_v3', JSON.stringify(latestData));
          }
        }
      } catch (err) {
        console.log("جاري فحص التحديثات...");
      }
    };

    fetchInstantData();
    
    // السر هنا: فحص كل 5 ثوانٍ لضمان ظهور التعديل فوراً للناس بدون ريفريش
    const interval = setInterval(fetchInstantData, 5000);
    return () => clearInterval(interval);
  }, [REPO_OWNER, REPO_NAME, FILE_PATH]);

  const syncToGitHub = async (updatedData: StoreData) => {
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      if (!GITHUB_TOKEN) {
        throw new Error("العيب: التوكن غير مقروء.\nالحل: تأكد من إضافة 'VITE_GITHUB_TOKEN' في إعدادات Vercel.");
      }

      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) {
        throw new Error("فشل الاتصال بـ GitHub لجلب الـ SHA");
      }
      
      const fileInfo = await res.json();

      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "تحديث لحظي فوري",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        alert("✅ تم الحفظ بنجاح! التعديلات ستظهر عند الجميع خلال ثوانٍ معدودة بدون ريفريش.");
      } else {
        const errorUpdate = await updateRes.json();
        throw new Error(`⚠️ فشل التحديث: ${errorUpdate.message}`);
      }
    } catch (err: any) {
      alert(`🛑 تقرير الأعطال:\n\n${err.message}`);
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
        
