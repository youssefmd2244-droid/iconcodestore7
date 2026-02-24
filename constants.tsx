import { StoreData } from './types';

export const ADMIN_PASSWORD = "20042007";
export const WHATSAPP_NUM_1 = "201094555299";
export const WHATSAPP_NUM_2 = "201102293350";

export const INITIAL_DATA: StoreData = {
  "categories": [],
  "products": [
    {
      "mediaType": "image",
      "category": "Hgg",
      "title": "هدية العمرة🕋",
      "price": 219,
      "description": "مصحف قطيفة وسبحة\nورق أبيض ⬅️حجم المصحف 14X20\nسعر الباكتج 120ج",
      "id": "1771827388570",
      "mediaUrl": "https://img.sanishtech.com/u/bd1262f7a6535ff0161c071a4e8bf164.jpg"
    }
  ],
  "settings": {
    "name": "ICON CODE STORE",
    "logoUrl": "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "accentColor": "#ec4899",
    "bgColor": "#0a0a1a",
    "language": "ar",
    "currency": "EGP",
    "lightingIntensity": 0.2,
    "layout": "default",
    "orderLinks": [
      {
        "label": "اطلب 1",
        "url": "https://wa.me/201094555299"
      },
      {
        "label": "اطلب 2",
        "url": "https://wa.me/201102293350"
      }
    ],
    "contactLinks": [
      {
        "label": "واتساب يوسف",
        "url": "https://wa.me/201094555299"
      },
      {
        "label": "واتساب عمر",
        "url": "https://wa.me/201102293350"
      }
    ]
  }
};