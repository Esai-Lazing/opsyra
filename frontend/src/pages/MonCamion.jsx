import React, { useState, useEffect } from 'react';
import { Truck, User, Fuel, Calendar, MapPin, Gauge } from 'lucide-react';
import api from '../api/axios';
import authService from '../services/authService';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

const MonCamion = () => {
    const [camion, setCamion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fuelHistory, setFuelHistory] = useState([]);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch assigned vehicle
                const assignmentRes = await api.get('/assignments/my');
                const vehicle = assignmentRes.data.camion || assignmentRes.data.engin;

                if (vehicle) {
                    setCamion(vehicle);

                    // 2. Fetch fuel consumption for this vehicle
                    // Note: Assuming /fuel/consommations returns all, we filter client-side.
                    // Ideally, use a query param like /fuel/consommations?camion_id=${vehicle.id}
                    const fuelRes = await api.get('/fuel/consommations');
                    const vehicleFuels = fuelRes.data
                        .filter(f => f.camion_id === vehicle.id)
                        .sort((a, b) => new Date(b.date_consommation) - new Date(a.date_consommation));

                    setFuelHistory(vehicleFuels);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
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

    if (!camion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    <Truck size={40} />
                </div>
                <h2 className="text-2xl font-bold">Aucun véhicule assigné</h2>
                <p className="text-muted-foreground max-w-sm">
                    Vous n'avez pas de véhicule assigné pour le moment. Veuillez contacter votre administrateur.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mon Véhicule</h1>
                    <p className="text-muted-foreground">
                        Détails du véhicule et historique de consommation
                    </p>
                </div>
                {camion.status && (
                    <Badge variant={camion.status === 'disponible' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                        {camion.status.toUpperCase()}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Information du Chauffeur */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={currentUser?.photo_profil} alt={currentUser?.name} />
                            <AvatarFallback className="bg-primary/5 text-xl font-bold text-primary">
                                {currentUser?.name?.substring(0, 2).toUpperCase() || 'CH'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{currentUser?.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 mt-1">
                                <User size={14} />
                                {currentUser?.role || 'Chauffeur'}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Email</p>
                                <p className="font-medium">{currentUser?.email || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Téléphone</p>
                                <p className="font-medium">{currentUser?.phone || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Date d'embauche</p>
                                <p className="font-medium">
                                    {currentUser?.created_at
                                        ? format(new Date(currentUser.created_at), 'dd MMM yyyy', { locale: fr })
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Information du Véhicule */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="text-primary" size={24} />
                            Détails du Véhicule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div>
                                <p className="text-sm text-muted-foreground">Matricule</p>
                                <p className="text-2xl font-bold tracking-wider text-primary">{camion.matricule}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Marque / Modèle</p>
                                <p className="font-semibold">{camion.marque} {camion.modele}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-muted-foreground mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-muted-foreground">Affectation</p>
                                    <p className="font-medium">{camion.affectation_site || 'Non assigné'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Gauge className="text-muted-foreground mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium capitalize">{camion.type || 'Standard'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rapport Carburant */}
            <Card className="shadow-sm border-border/60">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Fuel className="text-rose-500" size={20} />
                                Rapport de consommation
                            </CardTitle>
                            <CardDescription>
                                Historique des ravitaillements et consommations
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="h-8 px-3 font-normal">
                            Total: {fuelHistory.reduce((acc, curr) => acc + parseFloat(curr.quantite || 0), 0).toFixed(1)} L
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/40 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead className="text-right">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fuelHistory.length > 0 ? (
                                    fuelHistory.map((fuel) => (
                                        <TableRow key={fuel.id} className="hover:bg-muted/5">
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Calendar size={14} className="text-muted-foreground" />
                                                {format(new Date(fuel.date_consommation), 'dd MMM yyyy', { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200/20">
                                                    Consommation
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-foreground">
                                                {fuel.quantite} L
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground max-w-xs truncate">
                                                {fuel.notes || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            Aucune donnée de consommation disponible
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MonCamion;
