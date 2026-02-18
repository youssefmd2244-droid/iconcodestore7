
import { StoreData } from './types';

export const ADMIN_PASSWORD = "20042007";
export const WHATSAPP_NUM_1 = "201094555299";
export const WHATSAPP_NUM_2 = "201102293350";

export const INITIAL_DATA: StoreData = {
  categories: [
    { name: "برمجيات", icon: "💻" },
    { name: "تصميم", icon: "🎨" },
    { name: "تسويق", icon: "📢" }
  ],
  products: [
    {
      id: "1",
      title: "تصميم موقع احترافي",
      description: "نقوم بإنشاء وتطوير المواقع والمتاجر الإلكترونية بأحدث التقنيات العالمية.",
      price: 5000,
      mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      mediaType: "image",
      category: "برمجيات"
    }
  ],
  settings: {
    name: "ICON CODE STORE",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
    bgColor: "#0a0a1a",
    language: "ar",
    currency: "EGP",
    lightingIntensity: 0.4,
    layout: 'default',
    orderLinks: [
      { label: "اطلب 1", url: `https://wa.me/${WHATSAPP_NUM_1}` },
      { label: "اطلب 2", url: `https://wa.me/${WHATSAPP_NUM_2}` }
    ],
    contactLinks: [
      { label: "واتساب يوسف", url: `https://wa.me/${WHATSAPP_NUM_1}` },
      { label: "واتساب عمر", url: `https://wa.me/${WHATSAPP_NUM_2}` }
    ]
  }
};
