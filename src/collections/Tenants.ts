import type { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'planSummary', 'merchantEmail', 'createdAt'],
    hidden: ({ user }: any) => user?.role !== 'super-admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        return {
          id: {
            equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant,
          },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => user?.role === 'super-admin',
    update: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        return {
          id: {
            equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant,
          },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data?.generatedPassword) {
          data.generatedPassword = `Store@${Math.floor(100000 + Math.random() * 900000)}`;
        }

        if (data?.planType === 'starter') {
          data.subscriptionPlan = { maxProducts: 50, storageLimitMB: 250, allowCustomDomain: false, allowPremiumTemplates: false };
          data.planSummary = 'Starter (50 Prods, 250MB)';
        } else if (data?.planType === 'business') {
          data.subscriptionPlan = { maxProducts: 500, storageLimitMB: 2048, allowCustomDomain: true, allowPremiumTemplates: false };
          data.planSummary = 'Business (500 Prods, 2GB)';
        } else if (data?.planType === 'enterprise') {
          data.subscriptionPlan = { maxProducts: 999999, storageLimitMB: 10240, allowCustomDomain: true, allowPremiumTemplates: true };
          data.planSummary = 'Enterprise (Unlimited, 10GB)';
        } else if (data?.planType === 'custom') {
          const prods = data?.subscriptionPlan?.maxProducts ?? 0;
          const storageMB = data?.subscriptionPlan?.storageLimitMB ?? 0;
          const storageText = storageMB >= 1024 ? `${(storageMB / 1024).toFixed(1)}GB` : `${storageMB}MB`;
          data.planSummary = `Custom (${prods} Prods, ${storageText})`;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create' && doc.merchantEmail && doc.generatedPassword) {
          try {
            const existingUsers = await req.payload.find({
              collection: 'users',
              where: { email: { equals: doc.merchantEmail } },
            });

            if (existingUsers.docs.length === 0) {
              await req.payload.create({
                collection: 'users',
                data: {
                  email: doc.merchantEmail,
                  password: doc.generatedPassword,
                  role: 'tenant-admin',
                  tenant: doc.id,
                },
              });
            }
          } catch (error) {
            console.error('Error auto-creating merchant user:', error);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'planSummary',
      type: 'text',
      label: 'Selected Plan Summary',
      admin: { readOnly: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Store Details',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Store / Brand Name' },
            { name: 'slug', type: 'text', required: true, unique: true, label: 'Subdomain Slug' },
            {
              type: 'row',
              fields: [
                { name: 'merchantEmail', type: 'email', required: true, label: 'Merchant Owner Email' },
                { name: 'contactPhone', type: 'text', label: 'Merchant Mobile Number' },
              ],
            },
            {
              name: 'generatedPassword',
              type: 'text',
              label: 'Merchant Initial Password',
              defaultValue: () => `Store@${Math.floor(100000 + Math.random() * 900000)}`,
            },
          ],
        },
        {
          label: 'Branding & Store Settings',
          fields: [
            {
              name: 'brandLogo',
              type: 'text',
              label: 'Store Logo Image URL',
              admin: { placeholder: 'https://example.com/logo.png' },
            },
            {
              name: 'primaryColor',
              type: 'select',
              options: [
                { label: 'Royal Indigo (Default)', value: '#4f46e5' },
                { label: 'Emerald Green', value: '#059669' },
                { label: 'Crimson Red', value: '#dc2626' },
                { label: 'Classic Slate Black', value: '#0f172a' },
                { label: 'Rose Pink', value: '#e11d48' },
              ],
              defaultValue: '#4f46e5',
              label: 'Store Primary Theme Color',
            },
            {
              name: 'announcementText',
              type: 'text',
              defaultValue: '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | ঢাকার ভেতরে শিপিং ৳৬০, বাইরে ৳১২০',
              label: 'Top Announcement Bar Text',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappNumber',
                  type: 'text',
                  label: 'WhatsApp Live Chat Phone',
                  admin: { placeholder: '8801712345678' },
                },
                {
                  name: 'metaPixelId',
                  type: 'text',
                  label: 'Meta (Facebook) Pixel ID',
                  admin: { placeholder: 'e.g. 123456789012345' },
                },
              ],
            },
          ],
        },
        {
          label: 'Plan & Quotas',
          fields: [
            {
              name: 'planType',
              type: 'select',
              options: [
                { label: 'Starter Plan (50 Products, 250MB)', value: 'starter' },
                { label: 'Business Plan (500 Products, 2GB)', value: 'business' },
                { label: 'Enterprise Plan (Unlimited, 10GB)', value: 'enterprise' },
                { label: 'Custom Plan (Manual Override)', value: 'custom' },
              ],
              defaultValue: 'starter',
              required: true,
            },
            {
              name: 'subscriptionPlan',
              type: 'group',
              admin: { condition: (data) => data?.planType === 'custom' },
              fields: [
                { name: 'maxProducts', type: 'number', defaultValue: 50 },
                { name: 'storageLimitMB', type: 'number', defaultValue: 250 },
                { name: 'allowCustomDomain', type: 'checkbox', defaultValue: false },
                { name: 'allowPremiumTemplates', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Free Trial', value: 'trial' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
      admin: { position: 'sidebar' },
    },
  ],
};
