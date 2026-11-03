import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import { s3Storage } from '@payloadcms/storage-s3';

import { Users } from './collections/Users';
import { Tenants } from './collections/Tenants';
import { Products } from './collections/Products';
import { Orders } from './collections/Orders';
import { Categories } from './collections/Categories';
import { Pages } from './collections/Pages';
import { Coupons } from './collections/Coupons';
import { Media } from './collections/Media';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [
    Users,
    Tenants,
    Products,
    Orders,
    Categories,
    Pages,
    Media,
    Coupons,
  ],
  plugins: [
    // ☁️ Cloudflare R2 S3-Compatible Cloud Storage Engine
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || 'my-bucket',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT || '',
      },
    }),
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'secret_key_placeholder',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
});