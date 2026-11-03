import type { CollectionConfig } from 'payload';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'isHomepage', 'isLandingPage', 'tenant', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;
        return { tenant: { equals: tenantId } };
      }
      return true; // Public read for storefront
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;
        return { tenant: { equals: tenantId } };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;
        return { tenant: { equals: tenantId } };
      }
      return false;
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.user && req.user.role === 'tenant-admin' && req.user.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }
        if (data?.title && (!data?.slug || data.slug.trim() === '')) {
          data.slug = slugify(data.title);
        } else if (data?.slug) {
          data.slug = slugify(data.slug);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
      admin: { placeholder: 'e.g. About Us or Eid Special Offer' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      label: 'Page URL Slug',
      admin: { placeholder: 'e.g. about-us or home' },
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Page Rich HTML / Text Content (Used for System Pages)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Draft', value: 'draft' },
          ],
          defaultValue: 'published',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'isSystem',
          type: 'checkbox',
          defaultValue: false,
          label: 'Is Default Legal System Page?',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isHomepage',
          type: 'checkbox',
          defaultValue: false,
          label: 'Set as Main Storefront Homepage?',
        },
        {
          name: 'isLandingPage',
          type: 'checkbox',
          defaultValue: false,
          label: 'Is 1-Page High-Converting Offer Lander?',
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      label: 'Merchant Store',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Page Layout Blocks (Shopify / Elementor Style Builder)',
      blocks: [
        {
          slug: 'heroBanner',
          labels: { singular: 'Hero Banner', plural: 'Hero Banners' },
          fields: [
            { name: 'headline', type: 'text', required: true, label: 'Main Headline' },
            { name: 'subheadline', type: 'text', label: 'Sub-headline / Slogan' },
            { name: 'badgeText', type: 'text', defaultValue: '⚡ সীমিত সময়ের বিশেষ অফার', label: 'Top Badge Tag' },
            { name: 'imageUrl', type: 'text', label: 'Hero Image URL' },
            { name: 'buttonText', type: 'text', defaultValue: 'অর্ডার করতে ক্লিক করুন', label: 'CTA Button Text' },
          ],
        },
        {
          slug: 'featureGrid',
          labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
          fields: [
            { name: 'title', type: 'text', label: 'Section Title' },
            {
              name: 'features',
              type: 'array',
              fields: [
                { name: 'icon', type: 'text', label: 'Emoji / Icon' },
                { name: 'title', type: 'text', label: 'Feature Title' },
                { name: 'description', type: 'text', label: 'Feature Description' },
              ],
            },
          ],
        },
        {
          slug: 'testimonials',
          labels: { singular: 'Customer Reviews', plural: 'Customer Reviews' },
          fields: [
            { name: 'title', type: 'text', label: 'Section Title' },
            {
              name: 'reviews',
              type: 'array',
              fields: [
                { name: 'customerName', type: 'text', label: 'Customer Name' },
                { name: 'rating', type: 'number', defaultValue: 5, label: 'Rating (1-5)' },
                { name: 'comment', type: 'textarea', label: 'Review Comment' },
              ],
            },
          ],
        },
        {
          slug: 'faqAccordion',
          labels: { singular: 'FAQ Accordion', plural: 'FAQ Accordions' },
          fields: [
            { name: 'title', type: 'text', label: 'Section Title' },
            {
              name: 'faqs',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', label: 'Question' },
                { name: 'answer', type: 'textarea', label: 'Answer' },
              ],
            },
          ],
        },
      ],
    },
  ],
};