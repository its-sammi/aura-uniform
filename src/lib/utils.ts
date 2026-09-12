export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const formatPrice = (price: number | null | undefined, label?: string | null) => {
  if (price === null || price === undefined) return label || null;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)}`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

export const getWhatsAppUrl = (phone: string, message?: string) => {
  const cleaned = phone.replace(/\D/g, '');
  const text = encodeURIComponent(message || 'Hello, I would like to enquire about your products.');
  return `https://wa.me/${cleaned}?text=${text}`;
};

export const hasValue = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
