import type { CollectionConfig } from 'payload';
import { createDefaultPages } from '../lib/tenant/createDefaultPages';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'customDomain', 'status', 'planSummary', 'merchantEmail', 'createdAt'],
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
        // ১. অটো মার্চেন্ট ইউজার অ্যাকাউন্ট তৈরি
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

        // ২. নতুন স্টোরের জন্য অটো ৫টি ডিফল্ট লিগ্যাল পেজ সিডিং
        if (operation === 'create' && doc.id) {
          try {
            await createDefaultPages({
              payload: req.payload,
              tenantId: doc.id,
              storeName: doc.name || 'আমাদের শপ',
              supportPhone: doc.contactPhone || '01700000000',
              supportEmail: doc.merchantEmail || 'support@example.com',
            });
          } catch (err) {
            console.error('Error seeding default pages:', err);
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
          label: 'Store Details & Custom Domain',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Store / Brand Name' },
            { name: 'slug', type: 'text', required: true, unique: true, label: 'Subdomain Slug' },
            { name: 'customDomain', type: 'text', unique: true, index: true, label: 'Custom Domain (e.g. mybrand.com)' },
            { name: 'domainVerified', type: 'checkbox', defaultValue: false, label: 'Custom Domain DNS Verified' },
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
          label: 'Branding, Pixels & Theme Settings',
          fields: [
            { name: 'brandLogo', type: 'text', label: 'Store Logo Image URL' },
            { name: 'favicon', type: 'text', label: 'Store Favicon Image URL' },
            { name: 'primaryColor', type: 'text', defaultValue: '#4f46e5', label: 'Store Primary Theme Color (Hex Code)' },
            { name: 'showAnnouncement', type: 'checkbox', defaultValue: true, label: 'Show Announcement Bar' },
            { name: 'announcementText', type: 'text', defaultValue: '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি', label: 'Announcement Text' },
            { name: 'announcementBg', type: 'text', defaultValue: '#0f172a', label: 'Announcement Bar BG Color' },
            { name: 'announcementTextColor', type: 'text', defaultValue: '#ffffff', label: 'Announcement Bar Text Color' },
            { name: 'helplinePhone', type: 'text', label: 'Helpline / WhatsApp Phone' },
            { name: 'whatsappNumber', type: 'text', label: 'WhatsApp Live Chat Phone' },
            { name: 'stickyHeader', type: 'checkbox', defaultValue: true, label: 'Sticky Header Navbar' },
            { name: 'footerAboutText', type: 'textarea', label: 'Footer Short About Text' },
            { name: 'supportPhone', type: 'text', label: 'Support Phone' },
            { name: 'supportEmail', type: 'email', label: 'Support Email' },
            { name: 'address', type: 'text', label: 'Store Address' },
            { name: 'copyrightText', type: 'text', label: 'Footer Copyright Text' },
            { name: 'facebookUrl', type: 'text', label: 'Facebook Page URL' },
            { name: 'instagramUrl', type: 'text', label: 'Instagram Profile URL' },
            { name: 'youtubeUrl', type: 'text', label: 'YouTube Channel URL' },
            { name: 'showTrustBadges', type: 'checkbox', defaultValue: true, label: 'Show Trust Badges' },
            { name: 'customCss', type: 'textarea', label: 'Custom CSS Styles' },
            { name: 'customScripts', type: 'textarea', label: 'Custom Header Scripts' },
            { name: 'metaPixelId', type: 'text', label: 'Meta (Facebook) Pixel ID' },
            { name: 'facebookCapiToken', type: 'text', label: 'Facebook Conversion API (CAPI) Token' },
            { name: 'gtmContainerId', type: 'text', label: 'Google Tag Manager Container ID' },
            { name: 'ga4MeasurementId', type: 'text', label: 'Google Analytics 4 Measurement ID' },
            { name: 'apiTokens', type: 'json', label: 'API Secret Tokens' },
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