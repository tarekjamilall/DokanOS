import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-4">E-Commerce SaaS Platform</h1>
      <p className="text-slate-400 max-w-md mb-8">
        Welcome to the Main Platform. Manage your stores from the Admin Portal.
      </p>
      <a
        href="/admin"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
      >
        Go to Super Admin Panel
      </a>
    </main>
  );
}
