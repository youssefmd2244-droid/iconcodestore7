import { StoreData } from './types';

export const ADMIN_PASSWORD = "20042007";
export const WHATSAPP_NUM_1 = "201094555299";
export const WHATSAPP_NUM_2 = "201102293350";

export const INITIAL_DATA: StoreData = {
  "categories": [
    {
      "name": "هدايا إسلاميه",
      "icon": "🏷️"
    },
    {
      "name": "ادوات منزلية ",
      "icon": "🏷️"
    },
    {
      "name": "ديكورات للمنزل",
      "icon": "🏷️"
    }
  ],
  "products": [
    {
      "mediaType": "image",
      "category": "هدايا إسلاميه",
      "title": "هدية العمرة🕋",
      "price": 219,
      "description": "مصحف قطيفة وسبحة\nورق أبيض ⬅️حجم المصحف 14X20\nسعر الباكتج 120ج",
      "id": "1771827388570",
      "mediaUrl": "https://img.sanishtech.com/u/bd1262f7a6535ff0161c071a4e8bf164.jpg"
    },
    {
      "mediaType": "image",
      "category": "هدايا إسلاميه",
      "description": "خامة ممتازة 👌\nالتلبيس من أول 4سنوات إلى 12,سنة\nسعر القطعة200😍",
      "title": "إسدال قطيفة بناتي✨",
      "price": 299,
      "id": "1771902845567",
      "mediaUrl": "https://img.sanishtech.com/u/2c449beb9982342f9e1fe97778e75360.jpg"
    },
    {
      "mediaType": "image",
      "category": "General",
      "title": "شماعه",
      "price": 69,
      "description": "القطعتين بسعر قطعة 🔥🔥🔥",
      "mediaUrl": "https://img.sanishtech.com/u/8c7b4b29b99b6873289c13beb9f03737.jpg",
      "id": "1771903548368"
    },
    {
      "mediaType": "image",
      "category": "ادوات منزلية ",
      "description": "",
      "title": "دولاب تخزين اطفال ",
      "price": 1549,
      "mediaUrl": "https://img.sanishtech.com/u/274ac4dbd0054169e96ad07c82886138.jpg",
      "id": "1771904971987"
    },
    {
      "mediaType": "image",
      "category": "ديكورات للمنزل",
      "mediaUrl": "https://img.sanishtech.com/u/8e75a36211bc84e6a89df192e58975e2.jpg",
      "title": "جلاكسي بروچيكتو",
      "price": 1499,
      "id": "1771905913866"
    },
    {
      "mediaType": "image",
      "category": "ادوات منزلية ",
      "title": "حامل الغسالة متحرك💯",
      "price": 199,
      "mediaUrl": "https://img.sanishtech.com/u/98a9cc87ccbc448fa0c7e9ebaf18a542.jpg",
      "id": "1771906812167"
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