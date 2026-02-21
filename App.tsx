import React, { useState, useEffect } from 'react';
import { StoreData, Product, StoreSettings } from './types';
import { INITIAL_DATA, ADMIN_PASSWORD } from './constants';
import StoreFront from './components/StoreFront';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [data, setData] = useState<StoreData>(() => {
    const saved = localStorage.getItem('icon_code_pro_v3');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [view, setView] = useState<'store' | 'admin'>('store');

  // --- إعدادات GitHub API (تم وضع مفتاحك هنا) ---
  const GITHUB_TOKEN = "Ghp_t9Ka22wGPxbYFIueoJlxJLqVMCAPtJ2kVMKI";
  const REPO_OWNER = "youssefmd2244-droid";
  const REPO_NAME = "7icon.code.store";
  const FILE_PATH = "constants.tsx";

  // وظيفة المزامنة التلقائية مع GitHub
  const syncToGitHub = async (updatedData: StoreData) => {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      const fileInfo = await res.json();

      const newContent = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(updatedData, null, 2)};`;

      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
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
      console.log("GitHub Synced ✅");
    } catch (err) {
      console.error("GitHub Sync Failed ❌", err);
    }
  };

  // Live Sync Channel
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

    // Visual Theme Sync
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.settings.primaryColor);
    root.style.setProperty('--secondary-color', data.settings.secondaryColor);
    root.style.setProperty('--accent-color', data.settings.accentColor);
    root.style.setProperty('--bg-color', data.settings.bgColor);
    root.style.setProperty('--lighting-intensity', data.settings.lightingIntensity.toString());
  }, [data]);

  // دالة الحفظ المركزية التي تشغل الـ API
  const handleDataChange = (newData: StoreData) => {
    setData(newData);
    syncToGitHub(newData); // تحديث جيت هاب فوراً
  };

  const updateSettings = (settings: StoreSettings) => {
    handleDataChange({ ...data, settings });
  };

  const addCategory = (name: string, icon: string) => {
    handleDataChange({ ...data, categories: [...data.categories, { name, icon }] });
  };

  const removeCategory = (name: string) => {
    handleDataChange({ ...data, categories: data.categories.filter(c => c.name !== name) });
  };

  const addProduct = (product: Product) => {
    handleDataChange({ ...data, products: [...data.products, product] });
  };

  const deleteProduct = (id: string) => {
    handleDataChange({ ...data, products: data.products.filter(p => p.id !== id) });
  };

  const updateProduct = (updated: Product) => {
    handleDataChange({
      ...data,
      products: data.products.map(p => p.id === updated.id ? updated : p)
    });
  };

  return (
    <div className="min-h-screen">
      {view === 'store' ? (
        <StoreFront data={data} goToAdmin={() => setView('admin')} />
      ) : (
        <ControlPanel 
          data={data} 
          goBack={() => setView('store')}
          onUpdateSettings={updateSettings}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onAddProduct={addProduct}
          onDeleteProduct={deleteProduct}
          onUpdateProduct={updateProduct}
        />
      )}
    </div>
  );
};

export default App;
