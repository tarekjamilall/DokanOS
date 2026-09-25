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
    defaultColumns: ['title', 'slug', 'isHomepage', 'isLandingPage', 'tenant', 'createdAt'],
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
      admin: { placeholder: 'e.g. Eid Special Landing Page' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      label: 'Page URL Slug',
      admin: { placeholder: 'e.g. eid-offer or home' },
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
        // 1. Hero Banner Block
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
        // 2. Dynamic Product Grid Block
        {
          slug: 'productGrid',
          labels: { singular: 'Product Grid Catalog', plural: 'Product Grids' },
          fields: [
            { name: 'title', type: 'text', defaultValue: 'আমাদের জনপ্রিয় প্রডাক্টসমূহ', label: 'Section Title' },
            { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Filter by Category (Optional)' },
            { name: 'limit', type: 'number', defaultValue: 8, label: 'Max Products to Display' },
          ],
        },
        // 3. Product Spotlight (1-Click Cash on Delivery Buy Block)
        {
          slug: 'productSpotlight',
          labels: { singular: 'Single Product Spotlight (Quick Sale)', plural: 'Product Spotlights' },
          fields: [
            { name: 'product', type: 'relationship', relationTo: 'products', required: true, label: 'Select Featured Product' },
            { name: 'headline', type: 'text', label: 'Custom Offer Headline' },
            { name: 'fomoText', type: 'text', defaultValue: '🔥 স্টক সীমিত! প্রডাক্ট হাতে পেয়ে টাকা পরিশোধ করুন', label: 'FOMO / Guarantee Message' },
          ],
        },
        // 4. Trust Badges & Feature Grid Block
        {
          slug: 'featureGrid',
          labels: { singular: 'Trust & Feature Grid (Badges)', plural: 'Feature Grids' },
          fields: [
            { name: 'title', type: 'text', defaultValue: 'কেন আমাদের থেকে কেনাকাটা করবেন?', label: 'Section Title' },
            {
              name: 'features',
              type: 'array',
              label: 'Feature Items',
              fields: [
                { name: 'icon', type: 'text', defaultValue: '🚚', label: 'Emoji / Icon' },
                { name: 'title', type: 'text', required: true, label: 'Title' },
                { name: 'description', type: 'text', label: 'Short Description' },
              ],
            },
          ],
        },
        // 5. Customer Testimonials Block
        {
          slug: 'testimonials',
          labels: { singular: 'Customer Testimonials', plural: 'Testimonial Blocks' },
          fields: [
            { name: 'title', type: 'text', defaultValue: 'কাস্টমারদের ভালোবাসা ও মতামত', label: 'Section Title' },
            {
              name: 'reviews',
              type: 'array',
              label: 'Customer Reviews',
              fields: [
                { name: 'customerName', type: 'text', required: true, label: 'Customer Name' },
                { name: 'comment', type: 'textarea', required: true, label: 'Review Comment' },
                { name: 'rating', type: 'number', defaultValue: 5, label: 'Star Rating (1-5)' },
              ],
            },
          ],
        },
        // 6. FAQ Accordion Block
        {
          slug: 'faqAccordion',
          labels: { singular: 'FAQ Accordion', plural: 'FAQ Accordions' },
          fields: [
            { name: 'title', type: 'text', defaultValue: 'সাধারণ কিছু প্রশ্ন ও উত্তর (FAQ)', label: 'Section Title' },
            {
              name: 'faqs',
              type: 'array',
              label: 'FAQ Items',
              fields: [
                { name: 'question', type: 'text', required: true, label: 'Question' },
                { name: 'answer', type: 'textarea', required: true, label: 'Answer' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
