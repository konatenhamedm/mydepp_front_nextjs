'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AnimatedContent from '@/components/ui/AnimatedContent';
import { MagasinProvider } from '@/context/MagasinContext';

// Pages qui gèrent leur propre layout/padding (pas de padding supplémentaire)
const NO_EXTRA_PADDING_ROUTES = ['/faq'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const user = session?.user as any;
  const isPro = user?.type === 'PROFESSIONNEL' || user?.type === 'ETABLISSEMENT';

  const hasExtraPadding = !NO_EXTRA_PADDING_ROUTES.some(route =>
    pathname?.endsWith(route)
  );

  return (
    <MagasinProvider>
      <div className="min-h-screen bg-[#F8FAFC]">
        {!isPro && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}
        <div className={`transition-all duration-300 ${!isPro ? (sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60') : ''}`}>
          <Navbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className={`p-5 sm:p-6 ${hasExtraPadding ? 'sm:px-8' : ''}`}>
            <AnimatedContent>
              {children}
            </AnimatedContent>
          </main>
        </div>
      </div>
    </MagasinProvider>
  );
}