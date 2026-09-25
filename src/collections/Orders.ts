import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerName', 'customerPhone', 'grandTotal', 'orderStatus', 'paymentStatus', 'tenant', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate Order Number if not present
        if (!data?.orderNumber) {
          data.orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Order ID / Number',
      admin: {
        readOnly: true,
      },
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
      type: 'tabs',
      tabs: [
        {
          label: 'Customer & Shipping Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'customerName',
                  type: 'text',
                  required: true,
                  label: 'Customer Name',
                  admin: { placeholder: 'e.g. Rahat Chowdhury' },
                },
                {
                  name: 'customerPhone',
                  type: 'text',
                  required: true,
                  label: 'Customer Phone (Primary for COD)',
                  admin: { placeholder: 'e.g. 01712345678' },
                },
              ],
            },
            {
              name: 'deliveryAddress',
              type: 'textarea',
              required: true,
              label: 'Full Delivery Address',
              admin: { placeholder: 'House/Road/Area, District' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'shippingZone',
                  type: 'select',
                  options: [
                    { label: 'Inside Dhaka (৳60)', value: 'inside-dhaka' },
                    { label: 'Outside Dhaka / Suburbs (৳120)', value: 'outside-dhaka' },
                    { label: 'Express Emergency Delivery (৳200)', value: 'express' },
                  ],
                  defaultValue: 'inside-dhaka',
                  required: true,
                  label: 'Shipping Location Zone',
                },
                {
                  name: 'shippingCharge',
                  type: 'number',
                  defaultValue: 60,
                  required: true,
                  label: 'Shipping Charge (৳ BDT)',
                },
              ],
            },
            {
              name: 'customerNote',
              type: 'textarea',
              label: 'Customer Delivery Instructions / Note',
            },
          ],
        },
        {
          label: 'Ordered Items & Total',
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              label: 'Order Line Items',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      type: 'relationship',
                      relationTo: 'products',
                      required: true,
                      label: 'Product',
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      defaultValue: 1,
                      required: true,
                      label: 'Quantity',
                    },
                    {
                      name: 'unitPrice',
                      type: 'number',
                      required: true,
                      label: 'Unit Price (৳)',
                    },
                    {
                      name: 'selectedVariant',
                      type: 'text',
                      label: 'Variant Info (e.g. Size: L, Color: Black)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtotal',
                  type: 'number',
                  required: true,
                  label: 'Items Subtotal (৳)',
                },
                {
                  name: 'discountAmount',
                  type: 'number',
                  defaultValue: 0,
                  label: 'Discount Amount (৳)',
                },
                {
                  name: 'grandTotal',
                  type: 'number',
                  required: true,
                  label: 'Grand Total Payable (৳ BDT)',
                },
              ],
            },
          ],
        },
        {
          label: 'Payment & Courier Sync',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentMethod',
                  type: 'select',
                  options: [
                    { label: 'Cash on Delivery (COD)', value: 'cod' },
                    { label: 'bKash / Nagad / Rocket', value: 'mfs' },
                    { label: 'Online Card Payment', value: 'card' },
                  ],
                  defaultValue: 'cod',
                  required: true,
                  label: 'Payment Method',
                },
                {
                  name: 'paymentStatus',
                  type: 'select',
                  options: [
                    { label: 'Unpaid (COD Pending)', value: 'unpaid' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Partially Paid (Advance Given)', value: 'partially-paid' },
                  ],
                  defaultValue: 'unpaid',
                  required: true,
                  label: 'Payment Status',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'courierName',
                  type: 'select',
                  options: [
                    { label: 'Steadfast Courier', value: 'steadfast' },
                    { label: 'Pathao Courier', value: 'pathao' },
                    { label: 'Paperfly', value: 'paperfly' },
                    { label: 'Manual Delivery / In-house', value: 'manual' },
                  ],
                  defaultValue: 'steadfast',
                  label: 'Assigned Courier Service',
                },
                {
                  name: 'trackingCode',
                  type: 'text',
                  label: 'Courier Tracking Code / CID',
                  admin: { placeholder: 'e.g. STDF-892301' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'orderStatus',
      type: 'select',
      options: [
        { label: 'Pending Payment', value: 'pending' },
        { label: 'Processing (অর্ডার কনফার্মড)', value: 'processing' },
        { label: 'On Hold (কল অপশন/পেন্ডিং)', value: 'on-hold' },
        { label: 'Completed (ডেলিভার্ড)', value: 'completed' },
        { label: 'Cancelled (বাতিল)', value: 'cancelled' },
        { label: 'Refunded (ফেরত)', value: 'refunded' },
        { label: 'Failed (ব্যর্থ)', value: 'failed' },
      ],
      defaultValue: 'processing',
      required: true,
      label: 'WooCommerce Order Status',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
