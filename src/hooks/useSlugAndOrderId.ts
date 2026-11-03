import { CollectionBeforeChangeHook } from 'payload';

// ১. বাংলা বা যেকোনো টাইটেল থেকে অটো-স্লাগ জেনারেটর
export const generateSlug: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+\$/g, '') || `product-${Date.now()}`;
    }
  }
  return data;
};

// ২. অটো ইউনিক অর্ডার আইডি জেনারেটর (e.g. #DKN-849201)
export const generateOrderId: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' && !data.orderId) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    data.orderId = `DKN-${randomDigits}`;
  }
  return data;
};
