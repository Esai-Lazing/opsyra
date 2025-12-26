import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Truck,
    Users,
    History,
    Fuel,
    AlertTriangle,
    LogOut,
    User,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '@/services/authService';
import { cn } from '@/utils/cn';
import { AppLogo } from '@/components/AppLogo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavItem = ({ to, icon: Icon, children, badge, onClick, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-3 px-3 py-1.5 rounded-lg text-[14px] font-normal transition-all duration-200",
                "hover:bg-accent/50",
                isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center px-0 w-12 mx-auto"
            )}
            title={isCollapsed ? children : undefined}
        >
            <Icon size={18} className={cn(
                "transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                isCollapsed && "mx-auto"
            )} />
            {!isCollapsed && (
                <>
                    <span className="flex-1">{children}</span>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                            {badge}
                        </span>
                    )}
                </>
            )}
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                />
            )}
        </NavLink>
    );
};

const NavSection = ({ title, children, isCollapsed }) => {
    return (
        <div className="mb-6">
            {title && !isCollapsed && (
                <div className="px-3 mb-2">
                    <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider">
                        {title}
                    </span>
                </div>
            )}
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
};

export const ModernSidebar = ({ onClose, isCollapsed = false }) => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const roles = user?.roles || [];
    const isAdmin = roles.includes('Admin') || roles.includes('Sous-admin');
    const isChauffeur = roles.includes('Chauffeur');
    const isFuelManager = roles.includes('Gestionnaire fuel');

    const handleLogout = async () => {
        await authService.logout();
        if (onClose) onClose();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={onClose ? { x: -280 } : false}
            animate={{
                x: 0,
                width: isCollapsed ? 64 : 280
            }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "inset-y-0 left-0 z-50 bg-background border-r border-border/40",
                "flex flex-col h-screen",
                onClose ? "fixed" : "relative"
            )}
        >
            {/* Header */}
            <div className={cn(
                "flex items-center h-16 border-b border-border/40",
                isCollapsed ? "justify-center px-2" : "justify-between px-4"
            )}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex items-center gap-2 group">
                            <AppLogo size={36} />
                            <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">Opsyra</span>
                        </div>
                    </motion.div>
                )}
                {isCollapsed && (
                    <div className="flex items-center justify-center w-10 h-10">
                        <AppLogo size={28} showText={false} />
                    </div>
                )}
                {onClose && !isCollapsed && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 overflow-y-auto py-6 custom-scrollbar",
                isCollapsed ? "px-2" : "px-3"
            )}>
                <NavSection isCollapsed={isCollapsed}>
                    <NavItem to="/dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed}>
                        Tableau de bord
                    </NavItem>
                </NavSection>

                {isAdmin && (
                    <NavSection title="Gestion" isCollapsed={isCollapsed}>
                        <NavItem to="/dashboard/camions" icon={Truck} isCollapsed={isCollapsed}>
                            Camions
                        </NavItem>
                        <NavItem to="/dashboard/engins" icon={Settings} isCollapsed={isCollapsed}>
                            Engins
                        </NavItem>
                        <NavItem to="/dashboard/assignments" icon={History} isCollapsed={isCollapsed}>
                            Affectations
                        </NavItem>
                        <NavItem to="/dashboard/personnel" icon={Users} isCollapsed={isCollapsed}>
                            Personnel
                        </NavItem>
                    </NavSection>
                )}

                {(isFuelManager || isAdmin) && (
                    <NavSection title="Fuel" isCollapsed={isCollapsed}>
                        <NavItem to="/dashboard/fuel" icon={Fuel} isCollapsed={isCollapsed}>
                            Fuel
                        </NavItem>
                        <NavItem to="/dashboard/rapport-fuel" icon={History} isCollapsed={isCollapsed}>
                            Rapport Fuel
                        </NavItem>
                    </NavSection>
                )}

                {isChauffeur && (
                    <NavSection title="Chauffeur" isCollapsed={isCollapsed}>
                        <NavItem to="/dashboard/mon-camion" icon={Truck} isCollapsed={isCollapsed}>
                            Mon Camion
                        </NavItem>
                        <NavItem to="/dashboard/rapport-fuel" icon={History} isCollapsed={isCollapsed}>
                            Rapport Journalier
                        </NavItem>
                    </NavSection>
                )}

                <NavSection title="Suivi" isCollapsed={isCollapsed}>
                    <NavItem to="/dashboard/incidents" icon={AlertTriangle} badge="3" isCollapsed={isCollapsed}>
                        Incidents
                    </NavItem>
                </NavSection>
            </nav>

            {/* Footer */}
            <div className={cn(
                "border-t border-border/40 p-3",
                isCollapsed && "px-2"
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/50 transition-all",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? 'Mon compte' : undefined}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-sm text-primary border border-primary/20 flex-shrink-0 overflow-hidden",
                                isCollapsed && "mx-auto"
                            )}>
                                {user?.photo_profil ? (
                                    <img
                                        src={user.photo_profil}
                                        alt={user?.name || 'Profil'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user?.name || 'Utilisateur'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email || ''}
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align={isCollapsed ? "start" : "end"}
                        side={isCollapsed ? "right" : "top"}
                        className="w-56"
                    >
                        {/* User Info Header */}
                        <DropdownMenuLabel className="px-3 py-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-xs text-primary border border-primary/20 overflow-hidden">
                                    {user?.photo_profil ? (
                                        <img
                                            src={user.photo_profil}
                                            alt={user?.name || 'Profil'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user?.name || 'Utilisateur'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email || ''}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Actions */}
                        <DropdownMenuItem
                            onClick={() => {
                                navigate('/dashboard/profile');
                            }}
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Mon profil</span>
                        </DropdownMenuItem>

                        {(isAdmin || roles.includes('Sous-admin')) && (
                            <DropdownMenuItem
                                onClick={() => {
                                    navigate('/dashboard/settings');
                                }}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Paramètres</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Déconnexion</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.aside>
    );
};

