import React from 'react';
import SidebarMenuComponent from '@/components/SidebarMenu';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header>
        <h1>Admin Dashboard</h1>
      </header>
      <SidebarMenuComponent />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
