'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allMenusPreviewUserId, setAllMenusPreviewUserId] = useState<string | null>(null);
  const showAllMenus = currentUser?.id === allMenusPreviewUserId;

  useEffect(() => {
    setAllMenusPreviewUserId(null);
  }, [currentUser?.id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        showAllMenus={showAllMenus}
        onShowAllMenus={() => {
          if (currentUser) setAllMenusPreviewUserId(currentUser.id);
        }}
        onRestoreRoleMenus={() => setAllMenusPreviewUserId(null)}
      />

      {/* Main content viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-[76px]' : 'lg:ml-72'
        }`}
      >
        <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} showAllMenus={showAllMenus} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
