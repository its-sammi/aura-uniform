export type Brand = 'aura';

export interface Business {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  business_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  path: string;
  sort_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_label: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  brand_name: string | null;
  show_home: boolean;
  show_section: boolean;
  showcase_order: number;
  active: boolean;
  archived: boolean;
  availability: string | null;
  sizes: string[] | null;
  variants: Array<{ name: string; value: string; price?: number }> | null;
  badges: string[] | null;
  created_at: string;
  updated_at: string;
  business?: Business;
  category?: Category;
  images?: ProductImage[];
}

export interface ShowcaseSettings {
  id: string;
  business_id: string;
  category_id: string | null;
  title: string;
  subtitle: string | null;
  theme: 'winter' | 'summer' | 'monsoon';
  visible: boolean;
  section_order: number;
  animation_speed: number;
  auto_rotate: boolean;
  animation_intensity: number;
  background: string;
  accent: string;
  text_color: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}
