// src/components/Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authLib } from '@/lib/auth';
import clsx from 'clsx';
import {
  LayoutDashboard, Building2, BookOpen, Users,
  DollarSign, Settings, LogOut, MessageSquare, Crown
} from 'lucide-react';
import { useReviewMetrics } from '@/hooks/useReviews';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/salons', icon: Building2, label: 'Salons' },
  { href: '/dashboard/plan-requests', icon: Crown, label: 'Plan Requests' },
  { href: '/dashboard/bookings', icon: BookOpen, label: 'Bookings' },
  { href: '/dashboard/users', icon: Users, label: 'Users' },
  { href: '/dashboard/commissions', icon: DollarSign, label: 'Commissions' },
  { href: '/dashboard/reviews', icon: MessageSquare, label: 'Reviews' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { data: metrics } = useReviewMetrics();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-56 bg-gray-950 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-base">💈</div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">SalonBook</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);

          const showBadge = (label === 'Reviews' && metrics?.reportedCount > 0);
          const badgeCount = label === 'Reviews' ? metrics?.reportedCount : 0;

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </div>
              {showBadge && (
                <span className={clsx(
                  "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-gray-950",
                  "bg-red-600"
                )}>
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={() => authLib.logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
