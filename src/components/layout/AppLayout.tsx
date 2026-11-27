'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isChairperson } = useApp();

  // On the Founder landing page, remove the left sidebar completely
  const isFounderLanding = isChairperson && (pathname === '/' || pathname === '/dashboard');

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex">
      {!isFounderLanding && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isFounderLanding ? 'w-full' : collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Navbar
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          isFounderLanding={isFounderLanding}
        />

        <main className={`flex-1 p-4 lg:p-6 w-full ${isFounderLanding ? 'max-w-[1400px] mx-auto px-4 sm:px-8' : 'max-w-[1440px] mx-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
