// src/collections/Products.ts
import type { CollectionConfig } from 'payload';
import { revalidateTenantStorefront } from '../lib/cache/revalidate';
import { checkTenantProductLimit } from '../lib/tenant/checkLimits';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'price', 'stockStatus', 'updatedAt'],
  },
  access: {
    read: () => true, // পাবলিক ক্যাটালগ রিড
  },
  hooks: {
    // ⚡ Step 22: নতুন প্রোডাক্ট তৈরির সময় সাবস্ক্রিপশন লিমিট চেক
    beforeChange: [
      async ({ data, operation, req }) => {
        // শুধুমাত্র নতুন প্রোডাক্ট তৈরির সময় লিমিট চেক হবে (এডিটের সময় নয়)
        if (operation === 'create' && data?.tenant) {
          const tenantId = typeof data.tenant === 'object' ? data.tenant.id : data.tenant;
          const userRole = req.user?.role;

          // Super Admin কে লিমিট চেকিং থেকে ছাড় দেওয়া
          if (userRole !== 'super-admin' && tenantId) {
            const limitCheck = await checkTenantProductLimit(req.payload, tenantId);
            if (!limitCheck.allowed) {
              throw new Error(limitCheck.message);
            }
          }
        }
        return data;
      },
    ],
    // ⚡ Step 11: প্রোডাক্ট পরিবর্তন হলে কাস্টমার স্টোরফ্রন্ট ক্যাশ রিভ্যালিডেশন
    afterChange: [
      async ({ doc }) => {
        if (doc?.tenant) {
          try {
            const tenantSlug = typeof doc.tenant === 'object' ? doc.tenant.slug : null;
            if (tenantSlug) {
              await revalidateTenantStorefront(tenantSlug);
            }
          } catch (err) {
            console.error('Error triggering revalidation on product change:', err);
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'প্রোডাক্টের নাম',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      label: 'SEO স্লাগ (URL)',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'simple',
      options: [
        { label: 'সাধারণ পণ্য (Simple)', value: 'simple' },
        { label: 'ভ্যারিয়েশন পণ্য (Variable)', value: 'variable' },
        { label: 'ডিজিটাল পণ্য (Digital/Downloadable)', value: 'digital' },
        { label: 'এক্সটার্নাল/এফিলিয়েট (External)', value: 'external' },
      ],
      admin: {
        position: 'sidebar',
      },
      label: 'প্রোডাক্টের ধরন',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'বিক্রয় মূল্য (৳)',
    },
    {
      name: 'regularPrice',
      type: 'number',
      min: 0,
      label: 'রেগুলার/পূর্বের মূল্য (৳)',
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      label: 'প্রোডাক্ট গ্যালারি ছবি',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'বিস্তারিত বিবরণী',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'featureText',
          type: 'text',
        },
      ],
      label: 'মূল বৈশিষ্ট্যসমূহ (Features)',
    },

    // 📦 ইনভেন্টরি ও স্টক
    {
      name: 'inventory',
      type: 'group',
      label: 'স্টক ও ইনভেন্টরি ম্যানেজমেন্ট',
      fields: [
        {
          name: 'manageStock',
          type: 'checkbox',
          defaultValue: true,
          label: 'স্টক অটো ট্র্যাকিং চালু রাখুন',
        },
        {
          name: 'stockQuantity',
          type: 'number',
          defaultValue: 10,
          label: 'বর্তমান স্টক পরিমাণ',
        },
        {
          name: 'stockStatus',
          type: 'select',
          defaultValue: 'in_stock',
          options: [
            { label: 'স্টকে আছে (In Stock)', value: 'in_stock' },
            { label: 'স্টক আউট (Out of Stock)', value: 'out_of_stock' },
          ],
          label: 'স্টক স্ট্যাটাস',
        },
      ],
    },

    // 🎨 ভ্যারিয়েশন ও অ্যাট্রিবিউটস (Variable Product)
    {
      name: 'attributes',
      type: 'array',
      admin: {
        condition: (data) => data?.type === 'variable',
      },
      fields: [
        { name: 'name', type: 'text', label: 'অ্যাট্রিবিউট নাম (যেমন: Size/Color)' },
        {
          name: 'options',
          type: 'array',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
      label: 'অ্যাট্রিবিউট অপশনসমূহ',
    },
    {
      name: 'variations',
      type: 'array',
      admin: {
        condition: (data) => data?.type === 'variable',
      },
      fields: [
        { name: 'sku', type: 'text', label: 'SKU' },
        { name: 'color', type: 'text', label: 'কালার' },
        { name: 'size', type: 'text', label: 'সাইজ' },
        { name: 'price', type: 'number', required: true, label: 'ভ্যারিয়েশন মূল্য (৳)' },
        { name: 'regularPrice', type: 'number', label: 'রেগুলার মূল্য (৳)' },
        { name: 'stockQuantity', type: 'number', defaultValue: 5, label: 'স্টক' },
        { name: 'image', type: 'text', label: 'ভ্যারিয়েশন ছবির URL' },
      ],
      label: 'ভ্যারিয়েশন লিস্ট',
    },

    // 🔗 মাল্টি-টেন্যান্ট লিঙ্ক (Store Isolation)
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      label: 'স্টোর / টেন্যান্ট',
    },
  ],
};
