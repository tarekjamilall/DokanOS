// src/app/(frontend)/layout.tsx
import React from 'react';
import '../globals.css'; // 👈 গ্লোবাল সিএসএস ইম্পোর্ট

export const metadata = {
  title: 'E-Commerce SaaS',
  description: 'Multi-tenant E-Commerce SaaS Platform',
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        <div className="min-h-screen flex flex-col justify-between">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
