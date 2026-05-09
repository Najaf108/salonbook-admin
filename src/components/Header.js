// src/components/Header.js
'use client';
import { usePathname } from 'next/navigation';
import { authLib } from '@/lib/auth';
import { Bell } from 'lucide-react';

const TITLES = {
  '/dashboard':             'Dashboard',
  '/dashboard/salons':      'Salons',
  '/dashboard/bookings':    'Bookings',
  '/dashboard/users':       'Users',
  '/dashboard/commissions': 'Commissions',
  '/dashboard/settings':    'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const user = authLib.getUser();

  // Find the most specific matching title
  const title = Object.keys(TITLES)
    .filter(k => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{TITLES[title] || 'Admin'}</h1>
        <p className="text-xs text-gray-400">SalonBook Platform</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400">{user?.phone}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
