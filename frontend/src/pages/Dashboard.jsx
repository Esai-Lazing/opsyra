import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import LoadingScreen from '../components/LoadingScreen';
import { cn } from '@/utils/cn';
import authService from '../services/authService';
import DriverDashboard from './DriverDashboard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const StatCard = ({ title, value, change, trend, icon: Icon, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
        <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
                <div className="flex items-center gap-2">
                    {trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        trend === 'up' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                        {change}
                    </span>
                    <span className="text-sm text-muted-foreground">vs mois dernier</span>
                </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5" />
            </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
);

const ActivityItem = ({ user, action, target, value, time, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex items-center gap-4 py-3 hover:bg-accent/30 -mx-2 px-2 rounded-lg transition-colors"
    >
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-sm text-primary border border-primary/20">
            {user?.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user}</p>
            <p className="text-xs text-muted-foreground">
                {action} • <span className="text-foreground/70">{target}</span>
            </p>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{time}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = authService.getCurrentUser();

    useDocumentTitle('Tableau de bord');

    const roles = currentUser?.roles || [];
    const isDriver = roles.includes('Chauffeur') || currentUser?.role === 'Chauffeur';
    const isAdmin = roles.includes('Admin') || roles.includes('Sous-admin');
    const isFuelManager = roles.includes('Gestionnaire fuel');

    useEffect(() => {
        if (isDriver) {
            setLoading(false);
            return;
        }

        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération du dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [isDriver]);

    if (loading) return <LoadingScreen message="Chargement du tableau de bord..." />;

    // Render Driver Dashboard if applicable
    if (isDriver) {
        return <DriverDashboard />;
    }

    // Stats contextualisés selon le rôle
    const adminStats = [
        {
            title: "Engins actifs",
            value: data?.kpis?.total_engins ?? 0,
            change: data?.kpis?.delta_engins ?? "+0%",
            trend: (data?.kpis?.delta_engins || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Camions en service",
            value: data?.kpis?.total_camions ?? 0,
            change: data?.kpis?.delta_camions ?? "+0%",
            trend: (data?.kpis?.delta_camions || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Personnel",
            value: data?.kpis?.total_personnel ?? 0,
            change: data?.kpis?.delta_personnel ?? "+0%",
            trend: (data?.kpis?.delta_personnel || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Incidents ouverts",
            value: data?.kpis?.incidents_ouverts ?? 0,
            change: data?.kpis?.delta_incidents ?? "+0%",
            trend: (data?.kpis?.delta_incidents || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
    ];

    const fuelStats = [
        {
            title: "Stock carburant",
            value: `${data?.kpis?.fuel_stock ?? 0} L`,
            change: data?.kpis?.delta_fuel_stock ?? "+0%",
            trend: (data?.kpis?.delta_fuel_stock || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Conso (30j)",
            value: `${data?.kpis?.fuel_consumption_30d ?? data?.kpis?.fuel_consumption ?? 0} L`,
            change: data?.kpis?.delta_fuel_consumption ?? "+0%",
            trend: (data?.kpis?.delta_fuel_consumption || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Replis (30j)",
            value: data?.kpis?.fuel_replenishments_30d ?? data?.kpis?.fuel_replenishments ?? 0,
            change: data?.kpis?.delta_fuel_replenishments ?? "+0%",
            trend: (data?.kpis?.delta_fuel_replenishments || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
        {
            title: "Rapports fuel",
            value: data?.kpis?.fuel_reports ?? 0,
            change: data?.kpis?.delta_fuel_reports ?? "+0%",
            trend: (data?.kpis?.delta_fuel_reports || "").startsWith("-") ? "down" : "up",
            icon: Activity,
        },
    ];

    const stats = isFuelManager && !isAdmin ? fuelStats : adminStats;

    const activities = isFuelManager && !isAdmin
        ? (data?.recent_activities_fuel || data?.recent_activities || [])
        : (data?.recent_activities || []);

    return (
        <PageContainer
            title="Tableau de bord"
            description="Aperçu en temps réel de votre flotte et des opérations en cours."
            actions={
                <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30">
                    <Plus className="h-4 w-4" />
                    Nouvelle Mission
                </button>
            }
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} index={index} />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="lg:col-span-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Consommation Carburant</h3>
                            <p className="text-sm text-muted-foreground mt-1">Évolution sur les 30 derniers jours</p>
                        </div>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.fuel_stats || []}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}L`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                        {(data?.fuel_stats || []).map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`hsl(var(--primary))`}
                                                opacity={0.8 + (index / (data?.fuel_stats?.length || 1)) * 0.2}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Recent Activities */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="lg:col-span-3 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Activités Récentes</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isFuelManager && !isAdmin
                                        ? `${data?.kpis?.fuel_reports ?? 0} rapports fuel`
                                        : `${data?.kpis?.incidents_ouverts ?? 0} incidents en cours`}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {(activities || []).slice(0, 5).map((activity, index) => (
                                <ActivityItem key={index} {...activity} index={index} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Dashboard;
