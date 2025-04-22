'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarMenu as UISidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';

// Create a context for the sidebar
const SidebarContext = createContext({});

// Define and export the SidebarProvider component
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarContext.Provider value={{}}>
      {children}
    </SidebarContext.Provider>
  );
};

// Export the useSidebar hook if needed
export const useSidebar = () => useContext(SidebarContext);

const SidebarMenuComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isMounted) {
    return null; // Render nothing on the server
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <UISidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </UISidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default SidebarMenuComponent;