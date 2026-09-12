import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const fallbackClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : fallbackClient;

export const getPublicProductQuery = () =>
  supabase
    .from('products')
    .select('*, category:categories(*), business:businesses(*), images:product_images(*)')
    .eq('published', true)
    .eq('active', true)
    .eq('archived', false)
    .order('sort_order', { ascending: true, nullsFirst: false });

export const getBusinessBySlug = async (slug: string) => {
  const { data } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
  return data;
};

export const getBusinessCategories = async (businessSlug: string) => {
  const business = await getBusinessBySlug(businessSlug);
  if (!business) return [];
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true, nullsFirst: false });
  return data ?? [];
};
