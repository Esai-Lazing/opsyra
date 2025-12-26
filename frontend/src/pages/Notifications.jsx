import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Bell, AlertTriangle, Fuel, Check, CheckCheck, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import { cn } from '@/utils/cn';
import LoadingScreen from '@/components/LoadingScreen';
import authService from '@/services/authService';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Notifications = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Sous-admin');
    
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'incident', 'fuel_report'

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchNotifications();
        fetchUnreadCount();
        
        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [isAdmin, navigate]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?per_page=100');
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
        } finally {
            setLoading(false);
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

    const handleMarkAsRead = async (notification) => {
        if (notification.is_read) return;
        
        try {
            await api.put(`/notifications/${notification.id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la notification', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications', error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification);
        
        if (notification.type === 'incident') {
            navigate('/dashboard/incidents');
        } else if (notification.type === 'fuel_report') {
            navigate('/dashboard/fuel');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'incident':
                return <AlertTriangle className="h-5 w-5" />;
            case 'fuel_report':
                return <Fuel className="h-5 w-5" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'incident':
                return 'Incident';
            case 'fuel_report':
                return 'Rapport Fuel';
            default:
                return 'Notification';
        }
    };

    const getTypeClasses = (type) => {
        switch (type) {
            case 'incident':
                return {
                    accent: 'border-l-4 border-amber-500/80',
                    icon: 'text-amber-500',
                    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                    dot: 'bg-amber-500'
                };
            case 'fuel_report':
                return {
                    accent: 'border-l-4 border-cyan-500/80',
                    icon: 'text-cyan-500',
                    pill: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
                    dot: 'bg-cyan-500'
                };
            default:
                return {
                    accent: 'border-l-4 border-muted',
                    icon: 'text-muted-foreground',
                    pill: 'bg-muted text-foreground',
                    dot: 'bg-muted-foreground'
                };
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
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredNotifications = notifications.filter(notif => {
        const matchFilter = filter === 'all' || 
            (filter === 'unread' && !notif.is_read) || 
            (filter === 'read' && notif.is_read);
        const matchType = typeFilter === 'all' || notif.type === typeFilter;
        return matchFilter && matchType;
    });

    if (loading) return <LoadingScreen message="Chargement des notifications..." />;

    return (
        <PageContainer
            title="Notifications"
            description="Gérez toutes vos notifications d'incidents et de rapports fuel"
            actions={
                unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent transition-colors"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Tout marquer comme lu
                    </button>
                )
            }
        >
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Statut:</label>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] h-9 rounded-lg border-border/40 bg-background/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="unread">
                                Non lues ({notifications.filter(n => !n.is_read).length})
                            </SelectItem>
                            <SelectItem value="read">Lues</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Type:</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] h-9 rounded-lg border-border/40 bg-background/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="incident">Incidents</SelectItem>
                            <SelectItem value="fuel_report">Rapports Fuel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Liste des notifications */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-sm font-medium text-foreground mb-1">Aucune notification</p>
                        <p className="text-xs text-muted-foreground">
                            {filter === 'unread' 
                                ? "Vous n'avez aucune notification non lue" 
                                : "Aucune notification ne correspond à vos filtres"}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                                "rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer",
                                !notification.is_read && "bg-primary/5 border-primary/30"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 bg-muted/60",
                                    getTypeClasses(notification.type).icon
                                )}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={cn(
                                                    "text-sm font-semibold",
                                                    !notification.is_read ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-md",
                                                    getTypeClasses(notification.type).pill
                                                )}>
                                                    {getNotificationTypeLabel(notification.type)}
                                                </span>
                                                {notification.user && (
                                                    <span className="text-xs text-muted-foreground">
                                                        par {notification.user.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification);
                                            }}
                                            className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                                                notification.is_read
                                                    ? "text-muted-foreground hover:bg-accent"
                                                    : "text-primary hover:bg-primary/10"
                                            )}
                                            title={notification.is_read ? "Déjà lue" : "Marquer comme lue"}
                                        >
                                            {notification.is_read ? (
                                                <CheckCheck className="h-4 w-4" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground/90 mb-3 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(notification.created_at)}
                                        </span>
                                        {notification.is_read && notification.read_at && (
                                            <span className="text-xs text-muted-foreground">
                                                Lu {formatDate(notification.read_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </PageContainer>
    );
};

export default Notifications;

