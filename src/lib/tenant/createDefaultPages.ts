import { BasePayload } from 'payload';

type CreateDefaultPagesProps = {
  payload: BasePayload;
  tenantId: string;
  storeName: string;
  supportPhone?: string;
  supportEmail?: string;
};

type DefaultPage = {
  title: string;
  slug: string;
  isSystem: boolean;
  status: 'published' | 'draft';
  content: string;
};

export async function createDefaultPages({
  payload,
  tenantId,
  storeName = 'আমাদের শপ',
  supportPhone = '01700000000',
  supportEmail = 'support@example.com',
}: CreateDefaultPagesProps) {
  const defaultPages: DefaultPage[] = [
    {
      title: 'আমাদের কথা (About Us)',
      slug: 'about-us',
      isSystem: true,
      status: 'published',
      content: `<h2>স্বাগতম ${storeName}-এ!</h2><p>আমরা সেরা মানের পণ্য ও দ্রুততম ডেলিভারি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। কাস্টমার সন্তুষ্টিই আমাদের মূল লক্ষ্য।</p>`,
    },
    {
      title: 'যোগাযোগ করুন (Contact Us)',
      slug: 'contact-us',
      isSystem: true,
      status: 'published',
      content: `<h2>যোগাযোগের তথ্য</h2><p>ফোন: ${supportPhone}</p><p>ইমেইল: ${supportEmail}</p><p>যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>`,
    },
    {
      title: 'প্রাইভেসি পলিসি (Privacy Policy)',
      slug: 'privacy-policy',
      isSystem: true,
      status: 'published',
      content: `<h2>প্রাইভেসি পলিসি</h2><p>${storeName} কাস্টমারের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা প্রদান করে। আমরা কোনো তথ্য তৃতীয় পক্ষের কাছে শেয়ার করি না।</p>`,
    },
    {
      title: 'শর্তাবলী (Terms & Conditions)',
      slug: 'terms-and-conditions',
      isSystem: true,
      status: 'published',
      content: `<h2>সেবার শর্তাবলী</h2><p>${storeName}-এ যেকোনো অর্ডার প্রদান করার মাধ্যমে আপনি আমাদের সকল নিয়ম ও শর্তাবলী মেনে নিচ্ছেন।</p>`,
    },
    {
      title: 'রিটার্ন ও রিফান্ড নীতি (Return & Refund Policy)',
      slug: 'return-refund-policy',
      isSystem: true,
      status: 'published',
      content: `<h2>রিটার্ন নীতি</h2><p>পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে ত্রুটিপূর্ণ পণ্য রিটার্ন বা এক্সচেঞ্জ করতে পারবেন। বিস্তারিত জানতে আমাদের কল করুন: ${supportPhone}</p>`,
    },
  ];

  try {
    for (const page of defaultPages) {
      // টেন্যান্টের জন্য পেজ ডুপ্লিকেট হচ্ছে কিনা চেক
      const existing = await payload.find({
        collection: 'pages',
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { slug: { equals: page.slug } },
          ],
        },
        overrideAccess: true,
      });

      if (!existing.docs || existing.docs.length === 0) {
        await payload.create({
          collection: 'pages',
          data: {
            title: page.title,
            slug: page.slug,
            content: page.content,
            isSystem: page.isSystem,
            status: page.status,
            tenant: tenantId,
          },
          overrideAccess: true,
        });
      }
    }
    console.log(`✅ Default 5 System Pages created for Tenant ID: ${tenantId}`);
  } catch (error) {
    console.error('Error seeding default tenant pages:', error);
  }
}