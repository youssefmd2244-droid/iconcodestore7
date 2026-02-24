
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
  
  // --- نظام التحديث الخارق (Real-time Sync) ---
  useEffect(() => {
    const fetchInstantData = async () => {
      try {
        // نستخدم الـ API مع توقيت بالملي ثانية لضمان جلب بيانات جديدة كل ثانية
        const response = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?t=${Date.now()}`
        );
        
        if (response.ok) {
          const fileData = await response.json();
          const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
          
          const jsonMatch = decodedContent.match(/export const INITIAL_DATA: StoreData = ([\s\S]*?);/);
          if (jsonMatch && jsonMatch[1]) {
            const latestData = JSON.parse(jsonMatch[1]);
            
            // المقارنة الذكية: لا تقم بتحديث الحالة إلا إذا تغيرت البيانات فعلياً
            // هذا يمنع "الرمشة" في الصفحة ويجعل الظهور انسيابي وسريع جداً
            setData(prevData => {
              if (JSON.stringify(prevData) !== JSON.stringify(latestData)) {
                console.log("🚀 تم اكتشاف تحديث جديد! جاري العرض...");
                return latestData;
              }
              return prevData;
            });
            localStorage.setItem('icon_code_pro_v3', JSON.stringify(latestData));
          }
        }
      } catch (err) {
        console.log("فحص التحديثات الصامت يعمل...");
      }
    };

    fetchInstantData();
    
    // السر هنا: رفعنا السرعة ليفحص كل 1000 ملي ثانية (ثانية واحدة فقط)
    // بمجرد أن يكتمل الـ Push على GitHub ستظهر عند كل الناس فوراً بدون ريفريش
    const interval = setInterval(fetchInstantData, 1000); 
    return () => clearInterval(interval);
  }, [REPO_OWNER, REPO_NAME, FILE_PATH]);

  const syncToGitHub = async (updatedData: StoreData) => {
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    try {
      if (!GITHUB_TOKEN) {
        throw new Error("العيب: التوكن غير مقروء.\nالحل: تأكد من إضافة 'VITE_GITHUB_TOKEN' في إعدادات Vercel بشكل سليم.");
      }

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

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "تحديث لحظي فائق السرعة",
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: fileInfo.sha,
        }),
      });

      if (updateRes.ok) {
        // رسالة نجاح معدلة لتناسب السرعة الجديدة
        alert("✅ تم الحفظ! التحديث سيظهر عند جميع المستخدمين الآن خلال ثانية واحدة.");
      } else {
        const errorUpdate = await updateRes.json();
        throw new Error(`⚠️ فشل التحديث أونلاين: ${errorUpdate.message}`);
      }
    } catch (err: any) {
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
            
