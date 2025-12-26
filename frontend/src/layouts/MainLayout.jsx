import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import authService from '@/services/authService';

const MainLayout = () => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;
