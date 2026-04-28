// src/hooks/useAuth.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authLib } from '@/lib/auth';

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (!authLib.isAuthenticated()) router.replace('/login');
  }, [router]);
  return { user: authLib.getUser() };
}
