import React, { useState, useEffect, useRef } from 'react';
import { StoreData, Product } from '../types';

interface Props {
  data: StoreData;
  goToAdmin: () => void;
}

const StoreFront: React.FC<Props> = ({ data, goToAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Home');
  const [lightbox, setLightbox] = useState<Product | null>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- دالة المعالج الذكي للصور لضمان الظهور للجميع ومنع التكرار ---
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl: string) => {
    const target = e.target as HTMLImageElement;
    // إذا فشل الرابط، نضيف باراميتر "v=1" لإجبار المتصفح على تجاوز الكاش وجلب الصورة فوراً
    if (!target.src.includes('v=1')) {
      console.log("⚠️ محاولة جلب الصورة بنظام التحميل المباشر...");
      target.src = originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'v=1';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('active');
        });
      }, { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [data.products, searchQuery, activeCategory]);

  const filteredProducts = data.products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Home' ? !p.hideFromMain : p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a1a]/85 backdrop-blur-3xl border-b border-white/5 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => setActiveCategory('Home')}>
            <div className="w-14 h-14 bg-white/5 border border-white/10 p-2 rounded-2xl dazzle-element overflow-hidden">
               <img 
                 src={data.settings.logoUrl} 
                 alt="logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => handleImageError(e, data.settings.logoUrl)} 
               />
            </div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
               {data.settings.name}
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative w-full">
            <i className="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-white/30"></i>
            <input 
              type="text" 
              placeholder="ابحث عن الإبداع الذي يناسبك..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button onClick={goToAdmin} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
             <i className="fas fa-key text-white/40"></i>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setActiveCategory('Home')}
            className={`px-8 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap font-bold ${activeCategory === 'Home' ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/30' : 'bg-white/5 border-white/5 text-white/40'}`}
          >
            🏠 الرئيسية
          </button>
          {data.categories.map(c => (
            <button 
              key={c.name}
              onClick={() => setActiveCategory(c.name)}
              className={`px-8 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap font-bold ${activeCategory === c.name ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/30' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center text-center px-4 overflow-hidden">
         <div className="z-10 reveal" ref={el => revealRefs.current[1000] = el}>
            <h2 className="text-4xl md:text-6xl font-black mb-4">ICON CODE / Software Company</h2>
            <p className="text-white/50 max-w-3xl mx-auto leading-relaxed">الرقم واحد في مجال البرمجة والذكاء الاصطناعي. نحن نصنع المستقبل الرقمي بأعلى معايير الجودة.</p>
         </div>
      </section>

      {/* Product Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className={`grid gap-10 ${data.settings.layout === 'small' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {filteredProducts.map((p, idx) => (
            <div 
              key={p.id} 
              className="reveal group bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:scale-[1.03] transition-all duration-700 shadow-2xl hover:shadow-indigo-500/10"
              ref={el => revealRefs.current[idx] = el}
            >
              <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => setLightbox(p)}>
                {p.mediaType === 'image' ? (
                  <img 
                    src={p.mediaUrl} 
                    key={p.mediaUrl} // المفتاح يضمن تحديث الصورة فور تغيير الرابط
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                    onError={(e) => handleImageError(e, p.mediaUrl)}
                    loading="lazy"
                  />
                ) : (
                  <video src={p.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                )}
                <div className="absolute top-5 right-5 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black border border-white/10 uppercase tracking-widest">
                   {p.category}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-black mb-3">{p.title}</h3>
                <p className="text-white/40 text-xs mb-8 line-clamp-2 leading-relaxed">{p.description}</p>
                <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col">
                      <span className="text-3xl font-black text-indigo-400">{p.price}</span>
                      <span className="text-[10px] opacity-30 uppercase font-bold tracking-widest">{data.settings.currency}</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.settings.orderLinks.map((link, lidx) => (
                    <a 
                      key={lidx} 
                      href={link.url} 
                      target="_blank" 
                      className="py-4 rounded-2xl font-black text-[10px] text-center bg-indigo-600 hover:brightness-110 transition-all active:scale-95 text-white shadow-lg"
                    >
                      <i className="fab fa-whatsapp text-sm"></i> {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Animated Floating Buttons */}
      <div className="fixed bottom-10 left-10 z-[60] flex flex-col gap-5">
          <a href={data.settings.contactLinks[0].url} target="_blank" className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-2xl transition-all border-4 border-white/20 dazzle-element">
             <i className="fab fa-whatsapp text-3xl"></i>
          </a>
          <a href="tel:01094555299" className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl transition-all border-4 border-white/20 dazzle-element" style={{ animationDelay: '0.5s' }}>
             <i className="fas fa-phone-alt text-2xl"></i>
          </a>
          {data.settings.locationUrl && (
            <a href={data.settings.locationUrl} target="_blank" className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center shadow-2xl transition-all border-4 border-white/20 dazzle-element" style={{ animationDelay: '1s' }}>
               <i className="fas fa-map-marker-alt text-2xl"></i>
            </a>
          )}
      </div>

      {/* Lightbox Gallery */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setLightbox(null)}>
          <button className="absolute top-10 left-10 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-3xl hover:bg-white/20 transition-all shadow-2xl">
             <i className="fas fa-times"></i>
          </button>
          <div className="max-w-5xl w-full flex flex-col items-center gap-10" onClick={e => e.stopPropagation()}>
             <div className="w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10 group">
                {lightbox.mediaType === 'image' ? (
                  <img 
                    src={lightbox.mediaUrl} 
                    className="w-full h-full object-contain" 
                    onError={(e) => handleImageError(e, lightbox.mediaUrl)}
                  />
                ) : (
                  <video src={lightbox.mediaUrl} className="w-full h-full object-contain" controls autoPlay />
                )}
             </div>
             <div className="text-center max-w-3xl">
                <h2 className="text-4xl font-black mb-5">{lightbox.title}</h2>
                <p className="text-white/50 text-lg mb-10 leading-relaxed">{lightbox.description}</p>
                <div className="flex gap-6 justify-center">
                  {data.settings.orderLinks.map((link, i) => (
                    <a key={i} href={link.url} className="px-16 py-5 rounded-[2rem] bg-indigo-600 font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-indigo-900/40">
                       {link.label}
                    </a>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Footer / Founders Section */}
      <footer className="mt-24 bg-white/[0.01] border-t border-white/5 p-16">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
             <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">ICON CODE / Software Company</h2>
             <p className="text-white/30 text-sm max-w-2xl leading-relaxed">
                متخصصون في إنشاء وتطوير المواقع والمتاجر والأنظمة الذكية، مونتاج الفيديو، تصميم الهوية البصرية، الهندسة ثلاثية الأبعاد والتسويق الرقمي الشامل.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full py-12 border-y border-white/5">
            <div className="flex items-center justify-center md:justify-end gap-6 group">
               <div className="text-right">
                 <p className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">يوسف محمد</p>
                 <p className="text-xs text-white/30 font-bold uppercase tracking-widest">مهندس برمجيات</p>
                 <a href="https://wa.me/201094555299" target="_blank" className="text-sm font-black text-indigo-500 mt-2 block hover:underline">01094555299</a>
               </div>
               <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:scale-110 transition-all border border-indigo-500/20">
                 <i className="fas fa-code"></i>
               </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-6 group">
               <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:scale-110 transition-all border border-indigo-500/20">
                 <i className="fas fa-microchip"></i>
               </div>
               <div className="text-right">
                 <p className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">عمر محمد</p>
                 <p className="text-xs text-white/30 font-bold uppercase tracking-widest">مؤسس البرمجيات</p>
                 <a href="https://wa.me/201102293350" target="_blank" className="text-sm font-black text-indigo-500 mt-2 block hover:underline">01102293350</a>
               </div>
            </div>
          </div>

          <p className="text-[10px] text-white/10 uppercase font-black tracking-[0.5em]">© 2024 ICON CODE COMPANY. Number one in AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;
