import { ReactNode } from 'react';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
