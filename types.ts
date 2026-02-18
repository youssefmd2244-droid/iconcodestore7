
export type MediaType = 'image' | 'video';
export type StoreLayout = 'default' | 'small' | 'two' | 'stacked';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  mediaUrl: string;
  mediaType: MediaType;
  category: string;
  hideFromMain?: boolean;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface StoreSettings {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  language: string;
  currency: string;
  lightingIntensity: number;
  layout: StoreLayout;
  orderLinks: SocialLink[];
  contactLinks: SocialLink[];
  locationUrl?: string;
  trustFileUrl?: string;
}

export interface StoreData {
  categories: { name: string; icon: string }[];
  products: Product[];
  settings: StoreSettings;
}
