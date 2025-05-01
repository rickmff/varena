import React from 'react';
import { SidebarProvider } from '@/app/contexts/SidebarContext';
import { SidebarMenu } from '@/components/SidebarMenu';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <div className="flex min-h-screen">

          <SidebarMenu />
          <main className="p-4 pt-4 pb-24 md:pb-8 lg:px-8 max-w-[1400px] mx-auto">
            <div className="rounded-xl border border-border p-4 md:p-8 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
