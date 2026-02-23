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

  // --- إعدادات GitHub API مع نظام التشخيص الذاتي ---
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7iconcodestore"; 
  const FILE_PATH = "constants.tsx";

  const syncToGitHub = async (updatedData: StoreData) => {
    // تشخيص حالة التوكن من Vercel
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      // 1. فحص وجود التوكن في النظام
      if (!GITHUB_TOKEN) {
        throw new Error("العيب: التوكن غير مقروء.\nالحل: تأكد من إضافة 'VITE_GITHUB_TOKEN' في إعدادات Vercel بشكل سليم.");
      }

      // 2. فحص صلاحية التوكن والاتصال بـ GitHub
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          throw new Error("العيب: التوكن 'محروق' (Bad credentials).\nالحل: اصنع توكن جديد بصلاحية repo وضعه في Vercel ولا تنشره في الشات.");
        } else if (res.status === 404) {
          throw new Error("العيب: ملف الإعدادات غير موجود أو المستودع خاص.\nالحل: تأكد من اسم المستودع ومسار الملف.");
        }
        throw new Error(`عيب تقني: ${errorData.message}`);
      }
      
      const fileInfo = await res.json();

      // المحتوى الجديد مع الاحتفاظ بكلمة السر 20042007
      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      // 3. محاولة الحفظ النهائي
      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "تحديث من نظام كشف الأخطاء الذكي",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        alert("✅ تم الإصلاح والحفظ بنجاح! التعديلات ستظهر خلال دقيقة.");
      } else {
        const errorUpdate = await updateRes.json();
        throw new Error(`⚠️ فشل التحديث أونلاين: ${errorUpdate.message}`);
      }
    } catch (err: any) {
      // إظهار التقرير في حال الفشل
      alert(`🛑 تقرير نظام الأعطال:\n\n${err.message}`);
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
                                                     
