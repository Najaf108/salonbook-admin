// app/(dashboard)/layout.js
'use client';
import Sidebar from '@/components/Sidebar';
import Header  from '@/components/Header';
import { useRequireAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }) {
  useRequireAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
