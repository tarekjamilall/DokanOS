import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenant', 'createdAt'],
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin (Platform Owner)', value: 'super-admin' },
        { label: 'Merchant Admin (Tenant Owner)', value: 'tenant-admin' },
      ],
      defaultValue: 'tenant-admin',
      required: true,
      label: 'User Role',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      label: 'Assigned Merchant Tenant',
      admin: {
        condition: (data) => data?.role === 'tenant-admin',
        description: 'Which store this merchant has access to manage.',
      },
    },
  ],
};
