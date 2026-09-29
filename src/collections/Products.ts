import type { CollectionConfig } from 'payload';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // স্পেস তুলে হাইফেন (-) বসাবে
    .replace(/[^\w\-]+/g, '')    // স্পেশাল ক্যারেক্টার মুছে ফেলবে
    .replace(/\-\-+/g, '-');     // একের অধিক হাইফেন ১টিতে আনবে

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'price', 'stockStatus', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto assign merchant's tenant if user is tenant-admin
        if (req.user && req.user.role === 'tenant-admin' && req.user.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }

        // Auto-generate clean URL slug from Product Title
        if (data?.title) {
          if (!data?.slug || data.slug.trim() === '') {
            data.slug = slugify(data.title);
          } else {
            data.slug = slugify(data.slug);
          }
        }
        return data;
      },
    ],
  },
  // বাকি ক্ষেত্রসমূহ অপরিবর্তিত থাকবে...
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General & Pricing',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Product Title' },
            {
              name: 'slug',
              type: 'text',
              required: true,
              label: 'Product Slug (URL)',
              admin: { description: 'ফাঁকা রাখলে টাইটেল থেকে অটোমেটিক জেনারেট হবে।' }
            },
            {
              name: 'productType',
              type: 'select',
              options: [
                { label: 'Simple Product', value: 'simple' },
                { label: 'Variable Product', value: 'variable' },
                { label: 'Digital / Downloadable', value: 'digital' },
                { label: 'External / Affiliate', value: 'external' },
              ],
              defaultValue: 'simple',
              required: true,
            },
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number', required: true, label: 'Regular Price (৳)' },
                { name: 'salePrice', type: 'number', label: 'Sale Price (৳)' },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: 'Short Description',
            },
          ],
        },
        {
          label: 'Inventory & Stock',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'sku', type: 'text', label: 'SKU' },
                {
                  name: 'stockStatus',
                  type: 'select',
                  options: [
                    { label: 'In Stock', value: 'instock' },
                    { label: 'Out of Stock', value: 'outofstock' },
                  ],
                  defaultValue: 'instock',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'manageStock', type: 'checkbox', defaultValue: true },
                {
                  name: 'stockQuantity',
                  type: 'number',
                  defaultValue: 10,
                  admin: { condition: (data) => data?.manageStock === true },
                },
              ],
            },
          ],
        },
        {
          label: 'Attributes & Variations',
          fields: [
            {
              name: 'attributes',
              type: 'json',
              label: 'Selected Attributes Data',
            },
            {
              name: 'variations',
              type: 'array',
              label: 'Product Variations',
              fields: [
                { name: 'sku', type: 'text', label: 'Variant SKU' },
                { name: 'image', type: 'text', label: 'Variant Image URL' }, // 👈 এই যে ইমেজ ফিল্ড
                {
                  type: 'row',
                  fields: [
                    { name: 'price', type: 'number', required: true, label: 'Regular Price (৳)' },
                    { name: 'salePrice', type: 'number', label: 'Sale Price (৳)' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'stockQuantity', type: 'number', defaultValue: 10, label: 'Stock Quantity' },
                    {
                      name: 'stockStatus',
                      type: 'select',
                      options: [
                        { label: 'In Stock', value: 'instock' },
                        { label: 'Out of Stock', value: 'outofstock' },
                      ],
                      defaultValue: 'instock',
                    },
                  ],
                },
                {
                  name: 'attributes',
                  type: 'json',
                  label: 'Variant Attribute Values',
                },
              ],
            },
          ],
        }

      ],
    },
  ],
};
