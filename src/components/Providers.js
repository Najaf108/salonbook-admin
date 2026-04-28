// src/components/Providers.js
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
  }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: 13, fontWeight: 500, borderRadius: 8 },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
