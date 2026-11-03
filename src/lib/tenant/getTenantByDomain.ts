import { BasePayload } from 'payload';

export async function getTenantByDomain(payload: BasePayload, domain: string) {
  if (!domain) return null;

  // www. স্ট্রিপ করে ক্লিন ডোমেইন বের করা
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase().trim();

  try {
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { slug: { equals: cleanDomain } },
          { customDomain: { equals: cleanDomain } },
        ],
      },
      overrideAccess: true,
    });

    if (tenantQuery.docs && tenantQuery.docs.length > 0) {
      return tenantQuery.docs[0];
    }
    return null;
  } catch (error) {
    console.error(`Error resolving tenant for domain "${cleanDomain}":`, error);
    return null;
  }
}