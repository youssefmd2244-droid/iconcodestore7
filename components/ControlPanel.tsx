
import React, { useState } from 'react';
import { StoreData, Product, StoreSettings, MediaType, SocialLink } from '../types';
import { ADMIN_PASSWORD } from '../constants';

interface Props {
  data: StoreData;
  goBack: () => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onAddCategory: (name: string, icon: string) => void;
  onRemoveCategory: (name: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (updated: Product) => void;
}

const ControlPanel: React.FC<Props> = ({ 
  data, goBack, onUpdateSettings, onAddCategory, onRemoveCategory, onAddProduct, onDeleteProduct, onUpdateProduct 
}) => {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState<'settings' | 'products' | 'categories' | 'links' | 'ai'>('settings');

  // Form states
  const [newProd, setNewProd] = useState<Partial<Product>>({ mediaType: 'image', category: 'General' });
  const [newCat, setNewCat] = useState({ name: '', icon: '🏷️' });

  const handleDownload = () => {
    // Generate fresh HTML with injected data for "self-modifying" concept
    const currentData = JSON.stringify(data);
    const html = document.documentElement.outerHTML.replace(
      /localStorage\.getItem\('icon_code_pro_v3'\)/g, 
      `'${currentData.replace(/'/g, "\\'")}'`
    );
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ICON_CODE_STORE_PRO.html';
    a.click();
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="bg-white/5 p-16 rounded-[3rem] border border-white/10 w-full max-w-lg text-center shadow-[0_0_80px_rgba(99,102,241,0.1)]">
           <i className="fas fa-shield-alt text-6xl mb-10 text-indigo-500"></i>
           <h2 className="text-4xl font-black mb-10">نظام الإدارة الآمن</h2>
           <input 
             type="password" 
             className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 mb-8 text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
             placeholder="كلمة المرور..."
             value={pass}
             onChange={e => setPass(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && pass === ADMIN_PASSWORD && setAuth(true)}
           />
           <button 
             onClick={() => pass === ADMIN_PASSWORD ? setAuth(true) : alert('خطأ في كلمة المرور!')}
             className="w-full py-5 bg-indigo-600 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-900/40 active:scale-95 transition-all"
           >
             تأكيد الدخول
           </button>
           <button onClick={goBack} className="mt-10 text-white/20 hover:text-white/50 transition-all text-xs font-bold uppercase tracking-widest">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-96 bg-white/[0.02] border-l border-white/5 p-10 flex flex-col gap-4">
        <div className="mb-12">
            <h2 className="text-3xl font-black text-indigo-400">لوحة التحكم</h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-2">ICON CODE Engine</p>
        </div>
        
        {[
          { id: 'settings', label: 'إعدادات الهوية', icon: 'fa-tools' },
          { id: 'products', label: 'إدارة المنتجات', icon: 'fa-box' },
          { id: 'categories', label: 'الأقسام والتصنيفات', icon: 'fa-layer-group' },
          { id: 'links', label: 'الأزرار والروابط', icon: 'fa-external-link-alt' },
          { id: 'ai', label: 'تصدير المتجر المحدث', icon: 'fa-rocket' },
        ].map(i => (
          <button 
            key={i.id}
            onClick={() => setTab(i.id as any)}
            className={`p-5 rounded-3xl text-right flex items-center gap-5 transition-all ${tab === i.id ? 'bg-indigo-600 font-black shadow-2xl' : 'hover:bg-white/5 text-white/40'}`}
          >
            <i className={`fas ${i.icon} w-8`}></i> {i.label}
          </button>
        ))}
        
        <button onClick={goBack} className="mt-auto p-5 rounded-3xl bg-white/5 text-white/40 border border-white/5 font-bold">🚪 خروج آمن</button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto max-h-screen no-scrollbar">
        {tab === 'settings' && (
          <div className="max-w-4xl space-y-12">
            <h3 className="text-4xl font-black">هوية المتجر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                 <label className="text-xs font-black text-white/30 uppercase tracking-widest">اسم الموقع</label>
                 <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl" value={data.settings.name} onChange={e => onUpdateSettings({...data.settings, name: e.target.value})} />
              </div>
              <div className="space-y-3">
                 <label className="text-xs font-black text-white/30 uppercase tracking-widest">رابط اللوجو (URL)</label>
                 <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl" value={data.settings.logoUrl} onChange={e => onUpdateSettings({...data.settings, logoUrl: e.target.value})} />
              </div>
              <div className="space-y-3">
                 <label className="text-xs font-black text-white/30 uppercase tracking-widest">اللون الرئيسي</label>
                 <input type="color" className="w-full h-16 bg-transparent border-none p-0 cursor-pointer" value={data.settings.primaryColor} onChange={e => onUpdateSettings({...data.settings, primaryColor: e.target.value})} />
              </div>
              <div className="space-y-3">
                 <label className="text-xs font-black text-white/30 uppercase tracking-widest">قوة الإضاءة (0-1)</label>
                 <input type="range" min="0" max="1" step="0.1" className="w-full accent-indigo-500" value={data.settings.lightingIntensity} onChange={e => onUpdateSettings({...data.settings, lightingIntensity: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-3 md:col-span-2">
                 <label className="text-xs font-black text-white/30 uppercase tracking-widest">رابط ملف الثقة (Trust Badge URL)</label>
                 <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl" placeholder="https://..." value={data.settings.trustFileUrl || ''} onChange={e => onUpdateSettings({...data.settings, trustFileUrl: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="max-w-3xl space-y-12">
            <h3 className="text-4xl font-black">إدارة الأقسام والتصنيفات</h3>
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-3">
                     <label className="text-xs font-black text-white/30 uppercase tracking-widest">الأيقونة / Emoji</label>
                     <input 
                       className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-center text-3xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                       value={newCat.icon}
                       onChange={e => setNewCat({...newCat, icon: e.target.value})}
                     />
                  </div>
                  <div className="md:col-span-3 space-y-3">
                     <label className="text-xs font-black text-white/30 uppercase tracking-widest">اسم القسم</label>
                     <input 
                       placeholder="مثال: برمجيات، تصاميم 3D..."
                       className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                       value={newCat.name}
                       onChange={e => setNewCat({...newCat, name: e.target.value})}
                     />
                  </div>
               </div>
               <button 
                 onClick={() => { if(newCat.name) { onAddCategory(newCat.name, newCat.icon); setNewCat({name:'', icon:'🏷️'}); } }}
                 className="w-full py-5 bg-indigo-600 rounded-3xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all"
               >
                 + إضافة القسم الجديد للمتجر
               </button>
            </div>

            <div className="space-y-4">
               {data.categories.map(c => (
                 <div key={c.name} className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group shadow-xl">
                    <div className="flex items-center gap-6">
                       <span className="text-4xl group-hover:scale-110 transition-transform">{c.icon}</span>
                       <span className="text-xl font-black">{c.name}</span>
                    </div>
                    <button 
                      onClick={() => onRemoveCategory(c.name)}
                      className="w-14 h-14 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg"
                    >
                       <i className="fas fa-trash-alt"></i>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {tab === 'links' && (
          <div className="max-w-4xl space-y-12">
            <h3 className="text-4xl font-black">تخصيص أزرار واتساب والخرائط</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.settings.orderLinks.map((link, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">إعدادات زر الطلب {i + 1}</p>
                   <input placeholder="نص الزر" className="w-full bg-black/30 border border-white/10 p-4 rounded-xl text-sm" value={link.label} onChange={e => {
                     const copy = [...data.settings.orderLinks];
                     copy[i].label = e.target.value;
                     onUpdateSettings({...data.settings, orderLinks: copy});
                   }} />
                   <input placeholder="رابط الواتساب" className="w-full bg-black/30 border border-white/10 p-4 rounded-xl text-sm" value={link.url} onChange={e => {
                     const copy = [...data.settings.orderLinks];
                     copy[i].url = e.target.value;
                     onUpdateSettings({...data.settings, orderLinks: copy});
                   }} />
                </div>
              ))}
              <div className="bg-indigo-600/5 p-10 rounded-[3rem] border border-indigo-500/10 flex flex-col items-center justify-center text-center gap-6">
                 <h4 className="font-bold text-white/60">إضافة زر طلب إضافي</h4>
                 <button onClick={() => onUpdateSettings({...data.settings, orderLinks: [...data.settings.orderLinks, { label: `اطلب ${data.settings.orderLinks.length + 1}`, url: '' }]})} className="px-10 py-4 bg-indigo-600 rounded-2xl font-black">+ أضف زر طلب جديد</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-16">
            <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
               <h3 className="text-3xl font-black mb-10">{newProd.id ? 'تعديل المنتج المحدد' : 'إنشاء منتج جديد'}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input placeholder="اسم المنتج" className="bg-black/40 border border-white/10 p-5 rounded-2xl" value={newProd.title || ''} onChange={e => setNewProd({...newProd, title: e.target.value})} />
                  <input placeholder="السعر" type="number" className="bg-black/40 border border-white/10 p-5 rounded-2xl" value={newProd.price || ''} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} />
                  <textarea placeholder="وصف المنتج..." className="bg-black/40 border border-white/10 p-5 rounded-2xl md:col-span-2 h-40" value={newProd.description || ''} onChange={e => setNewProd({...newProd, description: e.target.value})} />
                  <input placeholder="رابط الميديا (صورة أو فيديو)" className="bg-black/40 border border-white/10 p-5 rounded-2xl" value={newProd.mediaUrl || ''} onChange={e => setNewProd({...newProd, mediaUrl: e.target.value})} />
                  <div className="grid grid-cols-2 gap-6">
                     <select className="bg-black/40 border border-white/10 p-5 rounded-2xl outline-none font-bold" value={newProd.mediaType} onChange={e => setNewProd({...newProd, mediaType: e.target.value as MediaType})}>
                        <option value="image">📸 صورة</option>
                        <option value="video">🎥 فيديو</option>
                     </select>
                     <select className="bg-black/40 border border-white/10 p-5 rounded-2xl outline-none font-bold" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                        <option value="General">عام</option>
                        {data.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                     </select>
                  </div>
                  <button 
                    onClick={() => {
                      if (newProd.title) {
                        if (newProd.id) onUpdateProduct(newProd as Product);
                        else onAddProduct({...newProd, id: Date.now().toString()} as Product);
                        setNewProd({ mediaType: 'image', category: 'General' });
                      }
                    }}
                    className="md:col-span-2 py-6 bg-indigo-600 rounded-3xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    {newProd.id ? 'حفظ التعديلات' : 'نشر المنتج الآن'}
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {data.products.map(p => (
                 <div key={p.id} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-6 group hover:border-indigo-500/30 transition-all">
                    <img src={p.mediaUrl} className="w-full aspect-video object-cover rounded-2xl opacity-60 group-hover:opacity-100 transition-all" />
                    <h4 className="font-black text-lg">{p.title}</h4>
                    <div className="flex gap-3">
                       <button onClick={() => setNewProd(p)} className="flex-1 py-3 bg-indigo-600/20 text-indigo-400 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all">تعديل</button>
                       <button onClick={() => onDeleteProduct(p.id)} className="flex-1 py-3 bg-red-600/20 text-red-400 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all">حذف</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="max-w-4xl space-y-12">
            <h3 className="text-4xl font-black">التحكم الذكي والتحديث الذاتي</h3>
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-16 rounded-[4rem] border border-white/10 text-center space-y-10">
               <i className="fas fa-magic text-8xl text-indigo-400 animate-bounce"></i>
               <h4 className="text-3xl font-black">نظام التعديل الذاتي للبرمجيات</h4>
               <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed">
                  عند النقر على الزر، سيتم إنشاء نسخة كاملة وجديدة من المتجر بملف واحد (HTML) يحتوي على كافة المنتجات والصور والتعديلات التي قمت بها. يمكنك رفع هذا الملف في أي مكان وسيعمل تلقائياً دون الحاجة لقواعد بيانات.
               </p>
               <button 
                onClick={handleDownload}
                className="px-16 py-6 bg-white text-black rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
               >
                 تصدير المتجر المحدث (Download HTML)
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ControlPanel;
