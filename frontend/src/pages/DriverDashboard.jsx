import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Truck, Fuel, AlertTriangle, TrendingUp, Calendar, MapPin, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import authService from '../services/authService';
import { cn } from '@/utils/cn';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg transition-all duration-300"
    >
        <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
                <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
                </div>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </div>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg transition-colors bg-opacity-10", colorClass)}>
                <Icon className={cn("h-6 w-6", colorClass.replace('bg-', 'text-'))} />
            </div>
        </div>
    </motion.div>
);

const DriverDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [vehicle, setVehicle] = useState(null);
    const [fuelStats, setFuelStats] = useState({ total: 0, history: [] });
    const [incidentStats, setIncidentStats] = useState({ active: 0, total: 0 });
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. My Vehicle
                const vehicleRes = await api.get('/assignments/my');
                const myVehicle = vehicleRes.data.camion || vehicleRes.data.engin;
                setVehicle(myVehicle);

                if (myVehicle) {
                    // 2. My Fuel
                    const fuelRes = await api.get('/fuel/consommations');
                    // Filter for my vehicle
                    const myFuels = fuelRes.data.filter(f => f.camion_id === myVehicle.id);
                    const totalFuel = myFuels.reduce((acc, curr) => acc + parseFloat(curr.quantite), 0);

                    // Group by date for chart (last 7 days or entries)
                    const fuelsByDate = myFuels.reduce((acc, curr) => {
                        const date = curr.date_consommation.split('T')[0];
                        acc[date] = (acc[date] || 0) + parseFloat(curr.quantite);
                        return acc;
                    }, {});

                    const chartData = Object.entries(fuelsByDate)
                        .map(([date, qty]) => ({ date: format(new Date(date), 'dd/MM'), fullDate: date, total: qty }))
                        .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
                        .slice(-7); // Last 7 entries

                    setFuelStats({ total: totalFuel, history: chartData });

                    // 3. My Incidents
                    const incRes = await api.get('/incidents');
                    // Filter incidents for my vehicle (or created by me)
                    // Assuming 'signale_par' is the user object, or we verify vehicle_id
                    const myIncidents = incRes.data.filter(i =>
                        (i.camion && i.camion.id === myVehicle.id) ||
                        (i.engin && i.engin.id === myVehicle.id)
                    );

                    const activeIncidents = myIncidents.filter(i => i.statut !== 'resolu').length;
                    setIncidentStats({ active: activeIncidents, total: myIncidents.length });
                }

            } catch (error) {
                console.error("Error fetching driver data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <PageContainer title="Tableau de bord">
                <div className="text-center py-20">
                    <Truck className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h2 className="text-xl font-semibold">Aucun véhicule assigné</h2>
                    <p className="text-muted-foreground mt-2">Veuillez contacter votre administrateur pour recevoir une affectation.</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={`Bonjour, ${currentUser?.name || 'Chauffeur'}`}
            description="Voici un aperçu de vos activités et de votre véhicule."
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        index={0}
                        title="Véhicule Assigné"
                        value={vehicle.matricule}
                        subtext={`${vehicle.marque} ${vehicle.modele}`}
                        icon={Truck}
                        colorClass="bg-primary/10 text-primary"
                    />
                    <StatCard
                        index={1}
                        title="Consommation Totale"
                        value={`${fuelStats.total.toFixed(0)} L`}
                        subtext="Historique complet"
                        icon={Fuel}
                        colorClass="bg-emerald-500/10 text-emerald-600"
                    />
                    <StatCard
                        index={2}
                        title="Incidents Actifs"
                        value={incidentStats.active.toString()}
                        subtext={`${incidentStats.total} signalés au total`}
                        icon={AlertTriangle}
                        colorClass="bg-rose-500/10 text-rose-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicle Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-6"
                    >
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Gauge className="h-5 w-5 text-primary" />
                            État du Véhicule
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/40">
                                <span className="text-sm text-muted-foreground">Statut</span>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                                    vehicle.status === 'disponible' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                        vehicle.status === 'en_panne' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>
                                    {vehicle.status ? vehicle.status.toUpperCase() : 'INCONNU'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/40">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Affectation
                                </span>
                                <span className="text-sm font-medium">{vehicle.affectation_site || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/40">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Mis en service le
                                </span>
                                <span className="text-sm font-medium">
                                    {vehicle.date_mise_en_service
                                        ? format(new Date(vehicle.date_mise_en_service), 'dd MMM yyyy', { locale: fr })
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Fuel Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6"
                    >
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Consommation récente
                        </h3>
                        <div className="h-[250px] w-full">
                            {fuelStats.history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={fuelStats.history}>
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
                                            }}
                                        />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                            {fuelStats.history.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Pas assez de données pour afficher le graphique
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};

export default DriverDashboard;
