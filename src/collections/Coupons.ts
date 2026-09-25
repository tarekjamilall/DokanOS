import type { CollectionConfig } from 'payload';

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'discountType', 'discountValue', 'expirationDate', 'tenant', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'super-admin') return true;
      if (user?.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;
        return { tenant: { equals: tenantId } };
      }
      return true; // Public check during checkout
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
        if (data?.code) {
          data.code = data.code.toUpperCase().trim();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      label: 'Coupon Code',
      admin: { placeholder: 'e.g. EID2026' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountType',
          type: 'select',
          options: [
            { label: 'Percentage (%)', value: 'percentage' },
            { label: 'Fixed Amount (৳)', value: 'fixed' },
          ],
          defaultValue: 'percentage',
          required: true,
        },
        {
          name: 'discountValue',
          type: 'number',
          required: true,
          label: 'Discount Value',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'minOrderAmount',
          type: 'number',
          defaultValue: 0,
          label: 'Minimum Order Amount (৳)',
        },
        {
          name: 'expirationDate',
          type: 'date',
          label: 'Coupon Expiry Date',
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
      admin: { position: 'sidebar' },
    },
  ],
};
