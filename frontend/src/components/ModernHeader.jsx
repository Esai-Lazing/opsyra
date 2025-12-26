import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, PanelLeft, LogOut, AlertTriangle, Fuel, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '@/services/authService';
import { cn } from '@/utils/cn';
import api from '@/api/axios';
import { ModeToggle } from '@/components/mode-toggle';
import { SearchModal } from '@/components/SearchModal';
import { AppLogo } from '@/components/AppLogo';

export const ModernHeader = ({ onMenuClick, onToggleSidebar, isCollapsed }) => {
    const navigate = useNavigate();
    const [searchFocused, setSearchFocused] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const notifRef = useRef(null);
    const user = authService.getCurrentUser();
    const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Sous-admin');

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    // Charger les notifications
    useEffect(() => {
        if (isAdmin) {
            fetchNotifications();
            fetchUnreadCount();

            // Rafraîchir toutes les 30 secondes
            const interval = setInterval(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?per_page=5');
            // Gérer la pagination Laravel
            if (response.data.data) {
                setNotifications(response.data.data);
            } else if (Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de notifications', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await api.put(`/notifications/${notification.id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la notification', error);
            }
        }

        // Naviguer vers la page appropriée
        if (notification.type === 'incident') {
            navigate('/dashboard/incidents');
        } else if (notification.type === 'fuel_report') {
            navigate('/dashboard/fuel');
        }
        setShowNotifications(false);
    };

    // Raccourci clavier Cmd/Ctrl + K pour ouvrir la recherche
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearchModal(true);
            }
            if (e.key === 'Escape' && showSearchModal) {
                setShowSearchModal(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showSearchModal]);

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        if (!showNotifications) return;
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'incident':
                return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
            case 'fuel_report':
                return <Fuel className="h-4 w-4 text-muted-foreground" />;
            default:
                return <Bell className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
                {/* Left: Menu & Search */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Mobile Menu Button & Logo */}
                    <div className="lg:hidden flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={onMenuClick}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                            <PanelLeft size={20} />
                        </button>
                        <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                            <AppLogo size={40} showText={false} className="flex-shrink-0" />
                        </div>
                    </div>

                    {/* Desktop Toggle Sidebar Button */}
                    <button
                        onClick={onToggleSidebar}
                        className="hidden lg:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="hidden md:flex relative flex-1 max-w-md items-center gap-3 h-10 px-2 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-all text-left group"
                    >
                        <Search
                            className={cn(
                                "h-4 w-4 transition-colors flex-shrink-0",
                                searchFocused ? "text-primary" : "text-muted-foreground"
                            )}
                        />
                        <span className="flex-1 text-sm text-muted-foreground">
                            Rechercher...
                        </span>
                        <kbd className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded border border-border">
                            <Command className="h-3 w-3" />K
                        </kbd>
                    </button>
                </div>

                {/* Right: Notifications & User */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {/* Notifications */}
                    {isAdmin && (
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-semibold rounded-full border-2 border-background">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Notifications */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                                            <h3 className="text-sm font-medium">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-primary hover:text-primary/80"
                                                    >
                                                        Tout marquer
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="h-6 w-6 rounded-sm flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {(() => {
                                                const unreadNotifications = notifications.filter(n => !n.is_read);
                                                return unreadNotifications.length === 0 ? (
                                                    <div className="p-6 text-center">
                                                        <p className="text-sm text-muted-foreground">Aucune notification non lue</p>
                                                    </div>
                                                ) : (
                                                    unreadNotifications.map((notification) => (
                                                        <button
                                                            key={notification.id}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={cn(
                                                                "w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-start gap-2 border-b border-border last:border-b-0",
                                                                !notification.is_read && "bg-accent/50"
                                                            )}
                                                        >
                                                            <div className="mt-0.5 flex-shrink-0">
                                                                {getNotificationIcon(notification.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <p className={cn(
                                                                        "text-sm",
                                                                        !notification.is_read ? "font-medium text-foreground" : "text-muted-foreground"
                                                                    )}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.is_read && (
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                );
                                            })()}
                                        </div>
                                        {notifications.filter(n => !n.is_read).length > 0 && (
                                            <div className="border-t border-border">
                                                <button
                                                    onClick={() => {
                                                        setShowNotifications(false);
                                                        navigate('/dashboard/notifications');
                                                    }}
                                                    className="w-full text-center text-sm text-primary hover:bg-accent py-2 transition-colors"
                                                >
                                                    Voir toutes
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                </div>
            </div>

            {/* Search Modal */}
            <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
        </header>
    );
};

