import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AppLogo } from '@/components/AppLogo';

export const PageContainer = ({ children, className, title, description, actions }) => {
    return (
        <div className="min-h-full bg-background flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 flex flex-col"
            >
                {/* Page Header - Linear.app inspired */}
                {(title || description || actions) && (
                    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
                        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="py-8 sm:py-10">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div className="space-y-2">
                                        {title && (
                                            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                                                {title}
                                            </h1>
                                        )}
                                        {description && (
                                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    {actions && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            {actions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content - Linear.app inspired spacing */}
                <main className={cn(
                    "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex-1",
                    title || description || actions ? "py-10 sm:py-12" : "py-8 sm:py-10",
                    className
                )}>
                    {children}
                </main>
            </motion.div>
        </div>
    );
};



