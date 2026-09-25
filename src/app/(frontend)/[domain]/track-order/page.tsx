import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import TrackOrderClient from './TrackOrderClient';

type Props = {
  params: Promise<{
    domain: string;
  }>;
};

export default async function TrackOrderPage({ params }: Props) {
  const { domain } = await params;
  const payload = await getPayload({ config: configPromise });

  let tenant: any = null;

  try {
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        slug: { equals: domain },
      },
    });

    if (tenantQuery.docs && tenantQuery.docs.length > 0) {
      tenant = tenantQuery.docs[0];
    }
  } catch (error) {
    console.error('Error fetching tenant for tracking page:', error);
  }

  const storeName = tenant?.name || domain.toUpperCase();

  return (
    <TrackOrderClient
      domain={domain}
      storeName={storeName}
      brandLogo={tenant?.brandLogo || ''}
      primaryColor={tenant?.primaryColor || '#4f46e5'}
      whatsappNumber={tenant?.whatsappNumber || ''}
    />
  );
}
