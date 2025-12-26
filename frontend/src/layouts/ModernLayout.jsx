import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernSidebar } from '@/components/ModernSidebar';
import { ModernHeader } from '@/components/ModernHeader';
import authService from '@/services/authService';

const ModernLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <ModernSidebar isCollapsed={isCollapsed} />
            </div>

            {/* Mobile Sidebar with Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <div className="lg:hidden fixed inset-0 z-50">
                            <ModernSidebar onClose={() => setIsSidebarOpen(false)} isCollapsed={false} />
                        </div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <ModernHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                />

                <main className="flex-1 overflow-y-auto bg-muted/20 custom-scrollbar">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ModernLayout;

