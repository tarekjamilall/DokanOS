import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // staticDir সরিয়ে রিমোট ক্লাউড স্টোরেজ ব্যবহারের উপযোগী করা হয়েছে
    adminThumbnail: 'card',
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'mediaType', 'fileSize', 'tenant', 'createdAt'],
  },
  access: {
    read: () => true, // পাবলিক সিডিএন রিড অ্যাকসেস
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text (SEO এর জন্য আবশ্যক)',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'ইমেজ ক্যাশন / বিবরণ',
    },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      defaultValue: 'image',
      options: [
        { label: 'ইমেজ (Uploaded Image)', value: 'image' },
        { label: 'ভিডিও (Embedded Video)', value: 'video' },
      ],
      label: 'মিডিয়া ধরন',
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.mediaType === 'video',
      },
      label: 'ইউটিউব / ভিমিও ভিডিও URL',
    },
    {
      name: 'videoPlatform',
      type: 'select',
      admin: {
        condition: (data) => data?.mediaType === 'video',
      },
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
      ],
      label: 'ভিডিও প্ল্যাটফর্ম',
    },
    {
      name: 'fileSize',
      type: 'number',
      label: 'ফাইল সাইজ (Bytes)',
    },
    {
      name: 'mimeType',
      type: 'text',
      label: 'MIME Type (e.g. image/webp)',
    },
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