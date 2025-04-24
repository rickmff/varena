import React from 'react';
import { SidebarProvider } from '@/app/contexts/SidebarContext';
import { SidebarMenu } from '@/components/SidebarMenu';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SidebarProvider>
        <SidebarMenu />
        <main>{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
