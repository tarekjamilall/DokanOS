import React from 'react';
import '@/app/globals.css'; // 👈 সিএসএস ইম্পোর্ট শুধু এখানে থাকবে

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
