'use client';

import React from 'react';
import { AuthProvider } from '@/lib/supabase/authContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
