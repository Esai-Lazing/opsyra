import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { AlertTriangle, Search, Eye, CheckCircle, Truck, Settings, User, MapPin, Calendar, X, Clock, Plus, Loader2, Camera, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import api from '../api/axios';
import authService from '../services/authService';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userVehicle, setUserVehicle] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [camions, setCamions] = useState([]);
    const [engins, setEngins] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState({ type: '', id: '' });

    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.roles?.some(r => r === 'Admin' || r === 'Sous-admin');
    const isChauffeur = currentUser?.roles?.includes('Chauffeur');

    // Incident Form State
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        gravite: 'moyenne',
        causes: '',
        actions_effectuees: '',
        temps_estime: '',
        image: null
    });

    // Mapping des probabilités par type d'incident (récupéré de l'ancienne implémentation)
    const incidentDefaults = {
        "Panne moteur": {
            gravite: 'elevee',
            temps_estime: 'Plus de 2 jours',
            causes: 'Surchauffe machine',
            actions_effectuees: 'Véhicule immobilisé en sécurité'
        },
        "Problème de freinage": {
            gravite: 'elevee',
            temps_estime: '2 à 4 heures',
            causes: 'Usure normale',
            actions_effectuees: 'Véhicule immobilisé en sécurité'
        },
        "Crevaison / Problème pneu": {
            gravite: 'moyenne',
            temps_estime: "Moins d'une heure",
            causes: 'Mauvaise route / Nid de poule',
            actions_effectuees: 'Changement de roue effectué'
        },
        "Fuite de liquide (Huile/Eau/Fuel)": {
            gravite: 'moyenne',
            temps_estime: '2 à 4 heures',
            causes: 'Usure normale',
            actions_effectuees: 'Niveaux complétés (Huile/Eau)'
        },
        "Problème électrique / Batterie": {
            gravite: 'moyenne',
            temps_estime: "Moins d'une heure",
            causes: 'Usure normale',
            actions_effectuees: 'Tentative de redémarrage (Échec)'
        },
        "Problème hydraulique": {
            gravite: 'elevee',
            temps_estime: 'Demi-journée',
            causes: 'Usure normale',
            actions_effectuees: 'Véhicule immobilisé en sécurité'
        },
        "Accident / Choc extérieur": {
            gravite: 'elevee',
            temps_estime: 'Indéterminé',
            causes: 'Choc extérieur / Objet',
            actions_effectuees: 'Appel assistance / Dépannage effectué'
        }
    };

    useEffect(() => {
        fetchIncidents();
        fetchUserVehicle();
        if (isAdmin) {
            fetchCamions();
            fetchEngins();
        }
    }, [isAdmin]);

    // Auto-fill defaults when title changes
    useEffect(() => {
        if (formData.titre && incidentDefaults[formData.titre]) {
            const defaults = incidentDefaults[formData.titre];
            setFormData(prev => ({
                ...prev,
                ...defaults
            }));
        }
    }, [formData.titre]);

    const fetchIncidents = async () => {
        try {
            const response = await api.get('/incidents');
            setIncidents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserVehicle = async () => {
        try {
            const response = await api.get('/assignments/my');
            if (response.data) {
                setUserVehicle(response.data.camion || response.data.engin);
            }
        } catch (error) {
            console.error("Erreur récupération véhicule:", error);
        }
    };

    const fetchCamions = async () => {
        try {
            const response = await api.get('/camions');
            setCamions(response.data || []);
        } catch (error) {
            console.error("Erreur récupération camions:", error);
        }
    };

    const fetchEngins = async () => {
        try {
            const response = await api.get('/engins');
            setEngins(response.data || []);
        } catch (error) {
            console.error("Erreur récupération engins:", error);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.put(`/incidents/${id}`, { statut: status });
            // Mettre à jour la liste des incidents
            fetchIncidents();
            // Mettre à jour l'incident sélectionné si c'est celui qui a été modifié
            if (selectedIncident?.id === id) {
                setSelectedIncident(response.data);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            alert(error.response?.data?.message || "Erreur lors de la mise à jour");
        }
    };

    const handleSubmitIncident = async (e) => {
        e.preventDefault();

        // Pour les admins, utiliser le véhicule sélectionné ou le véhicule assigné, sinon utiliser le véhicule assigné
        let vehicleToUse = null;
        let vehicleType = '';

        if (isAdmin) {
            // Si un véhicule a été sélectionné manuellement, l'utiliser
            if (selectedVehicle.id && selectedVehicle.type) {
                vehicleToUse = { id: selectedVehicle.id };
                vehicleType = selectedVehicle.type === 'camion' ? 'App\\Models\\Camion' : 'App\\Models\\Engin';
            }
            // Sinon, utiliser le véhicule assigné s'il existe
            else if (userVehicle) {
                vehicleToUse = userVehicle;
                vehicleType = userVehicle.matricule ? 'App\\Models\\Camion' : 'App\\Models\\Engin';
            }
            // Sinon, erreur
            else {
                alert("Veuillez sélectionner un véhicule.");
                return;
            }
        } else {
            if (!userVehicle) {
                alert("Aucun véhicule assigné. Impossible de signaler un incident.");
                return;
            }
            vehicleToUse = userVehicle;
            vehicleType = userVehicle.matricule ? 'App\\Models\\Camion' : 'App\\Models\\Engin';
        }

        setSubmitting(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        data.append('incidentable_id', vehicleToUse.id);
        data.append('incidentable_type', vehicleType);
        data.append('user_id', currentUser?.id);
        data.append('date_incident', new Date().toISOString().split('T')[0]);

        try {
            await api.post('/incidents', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowCreateModal(false);
            setFormData({ titre: '', description: '', gravite: 'moyenne', causes: '', actions_effectuees: '', temps_estime: '', image: null });
            setSelectedVehicle({ type: '', id: '' });
            fetchIncidents();
            // Optionnel: Afficher un toast de succès
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de la déclaration");
        } finally {
            setSubmitting(false);
        }
    };

    const getGraviteStyle = (gravite) => {
        switch (gravite) {
            case 'faible':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'moyenne':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'elevee':
                return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
            default:
                return 'bg-secondary text-muted-foreground border-border/40';
        }
    };

    const getStatusStyle = (statut) => {
        // Normaliser le statut (gérer les deux formats)
        const normalized = statut === 'en cours' ? 'en_cours' : statut;
        switch (normalized) {
            case 'ouvert':
                return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
            case 'en_cours':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'resolu':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-amber-400 border-emerald-500/20';
            default:
                return 'bg-secondary text-muted-foreground border-border/40';
        }
    };

    const filteredIncidents = incidents.filter(i => {
        const matchSearch = i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.camion?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.engin?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.engin?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.signale_par?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        // Normaliser le statut pour la comparaison (gérer les deux formats)
        const normalizedStatus = i.statut === 'en cours' ? 'en_cours' : i.statut;
        const matchStatus = filterStatus === 'all' || normalizedStatus === filterStatus || i.statut === filterStatus;
        return matchSearch && matchStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);

    // Reset à la page 1 quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    if (loading) return <LoadingScreen message="Chargement des incidents..." />;

    return (
        <>
            <PageContainer
                title="Incidents"
                description={
                    isChauffeur 
                        ? `${filteredIncidents.length} incident${filteredIncidents.length > 1 ? 's' : ''} lié${filteredIncidents.length > 1 ? 's' : ''} à votre véhicule`
                        : `${filteredIncidents.length} incident${filteredIncidents.length > 1 ? 's' : ''} signalé${filteredIncidents.length > 1 ? 's' : ''}`
                }
                actions={
                    <Button onClick={() => {
                        setShowCreateModal(true);
                        setSelectedVehicle({ type: '', id: '' });
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Signaler un incident
                    </Button>
                }
            >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher un incident..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-11 w-[180px] rounded-xl border-border/40 bg-background/50 backdrop-blur-sm">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="ouvert">Ouvert</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="resolu">Résolu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedIncidents.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Aucun incident trouvé</p>
                        </div>
                    ) : (
                        paginatedIncidents.map((incident, index) => (
                            <motion.div
                                key={incident.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                                onClick={() => setSelectedIncident(incident)}
                            >
                                {/* Header avec icône et badges */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-12 w-12 rounded-lg flex items-center justify-center transition-colors",
                                            incident.gravite === 'elevee' && "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500/20",
                                            incident.gravite === 'moyenne' && "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20",
                                            incident.gravite === 'faible' && "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20"
                                        )}>
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Incident #{incident.id}</p>
                                            <p className="text-xs font-medium text-foreground">
                                                {incident.titre || 'Sans titre'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                            getGraviteStyle(incident.gravite)
                                        )}>
                                            {incident.gravite === 'elevee' ? 'Élevée' : incident.gravite === 'moyenne' ? 'Moyenne' : 'Faible'}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                                        {incident.description}
                                    </p>
                                </div>

                                {/* Informations détaillées */}
                                <div className="space-y-2.5 mb-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        {incident.camion ? (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Truck className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-foreground">{incident.camion?.matricule || 'N/A'}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Settings className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-foreground">{incident.engin?.nom || incident.engin?.matricule || 'N/A'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            <span>{incident.signale_par?.name || incident.user?.name || 'Inconnu'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{new Date(incident.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer avec statut */}
                                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        getStatusStyle(incident.statut)
                                    )}>
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            (incident.statut === 'ouvert' || incident.statut === 'Ouvert') && "bg-rose-500",
                                            (incident.statut === 'en_cours' || incident.statut === 'en cours' || incident.statut === 'En cours') && "bg-amber-500",
                                            (incident.statut === 'resolu' || incident.statut === 'Résolu') && "bg-emerald-500"
                                        )} />
                                        {(incident.statut === 'en_cours' || incident.statut === 'en cours') ? 'En cours' :
                                            incident.statut === 'ouvert' ? 'Ouvert' :
                                                incident.statut === 'resolu' ? 'Résolu' : incident.statut}
                                    </span>
                                    {incident.temps_estime && (
                                        <span className="text-xs text-muted-foreground">
                                            {incident.temps_estime}
                                        </span>
                                    )}
                                </div>

                                {/* Gradient effect on hover */}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {filteredIncidents.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-6">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Affichage de <span className="font-medium text-foreground">{startIndex + 1}</span> à{' '}
                                <span className="font-medium text-foreground">{Math.min(endIndex, filteredIncidents.length)}</span> sur{' '}
                                <span className="font-medium text-foreground">{filteredIncidents.length}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Afficher</span>
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}>
                                    <SelectTrigger className="h-9 w-[70px] rounded-lg border-border/40 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="9">9</SelectItem>
                                        <SelectItem value="18">18</SelectItem>
                                        <SelectItem value="27">27</SelectItem>
                                        <SelectItem value="36">36</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        return page === 1 ||
                                            page === totalPages ||
                                            Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, index, array) => {
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsis && (
                                                    <span className="px-2 text-muted-foreground">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "h-9 min-w-[36px] px-3 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                                                        currentPage === page
                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                            : "bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/40"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </PageContainer>

            {/* Modal de création d'incident */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-lg shadow-2xl my-8"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40 sticky top-0 bg-card z-10 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <AlertTriangle className="text-rose-600" size={20} />
                                    Signaler un incident
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isAdmin
                                        ? "Sélectionnez un véhicule pour signaler l'incident"
                                        : userVehicle
                                            ? `Véhicule: ${userVehicle.matricule || userVehicle.nom}`
                                            : "Aucun véhicule assigné"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {!userVehicle && !isAdmin ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                    <Truck size={32} />
                                </div>
                                <h3 className="text-lg font-medium">Véhicule non trouvé</h3>
                                <p className="text-muted-foreground">Vous devez avoir un véhicule assigné pour signaler un incident.</p>
                                <Button onClick={() => setShowCreateModal(false)} variant="outline">Fermer</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitIncident} className="p-6 space-y-6">
                                {/* Sélection de véhicule pour les admins */}
                                {isAdmin && (
                                    <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-muted/30">
                                        <Label className="text-base font-semibold">Sélectionner un véhicule</Label>
                                        {userVehicle && (
                                            <div className="mb-3 p-3 rounded-lg bg-background/60 border border-border/30">
                                                <Label className="text-xs font-medium text-muted-foreground mb-1 block">Véhicule assigné (sera utilisé par défaut si aucun autre n'est sélectionné)</Label>
                                                <div className="flex items-center gap-2">
                                                    {userVehicle.matricule ? <Truck className="h-4 w-4 text-primary" /> : <Settings className="h-4 w-4 text-primary" />}
                                                    <span className="text-sm font-medium text-foreground">
                                                        {userVehicle.matricule || userVehicle.nom}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Type de véhicule</Label>
                                                <Select
                                                    value={selectedVehicle.type}
                                                    onValueChange={(value) => setSelectedVehicle({ type: value, id: '' })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="camion">Camion</SelectItem>
                                                        <SelectItem value="engin">Engin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>
                                                    {selectedVehicle.type === 'camion' ? 'Camion' : selectedVehicle.type === 'engin' ? 'Engin' : 'Véhicule'}
                                                </Label>
                                                <Select
                                                    value={selectedVehicle.id}
                                                    onValueChange={(value) => setSelectedVehicle({ ...selectedVehicle, id: value })}
                                                    disabled={!selectedVehicle.type}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedVehicle.type === 'camion' && camions.map(camion => (
                                                            <SelectItem key={camion.id} value={camion.id.toString()}>
                                                                {camion.matricule} - {camion.modele}
                                                            </SelectItem>
                                                        ))}
                                                        {selectedVehicle.type === 'engin' && engins.map(engin => (
                                                            <SelectItem key={engin.id} value={engin.id.toString()}>
                                                                {engin.nom} - {engin.matricule}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {selectedVehicle.id && (
                                            <p className="text-xs text-emerald-600 font-medium">
                                                ✓ Véhicule sélectionné : {selectedVehicle.type === 'camion'
                                                    ? camions.find(c => c.id.toString() === selectedVehicle.id)?.matricule
                                                    : engins.find(e => e.id.toString() === selectedVehicle.id)?.nom}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Affichage du véhicule assigné pour les non-admins */}
                                {userVehicle && !isAdmin && (
                                    <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                                        <Label className="text-sm font-medium text-muted-foreground mb-2">Véhicule assigné</Label>
                                        <div className="flex items-center gap-2">
                                            {userVehicle.matricule ? <Truck className="h-4 w-4 text-primary" /> : <Settings className="h-4 w-4 text-primary" />}
                                            <span className="text-sm font-medium text-foreground">
                                                {userVehicle.matricule || userVehicle.nom}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Type de panne</Label>
                                        <Select
                                            value={formData.titre}
                                            onValueChange={(val) => setFormData({ ...formData, titre: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner le type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Panne moteur">Panne moteur</SelectItem>
                                                <SelectItem value="Problème de freinage">Problème de freinage</SelectItem>
                                                <SelectItem value="Crevaison / Problème pneu">Crevaison / Problème pneu</SelectItem>
                                                <SelectItem value="Fuite de liquide (Huile/Eau/Fuel)">Fuite de liquide (Huile/Eau/Fuel)</SelectItem>
                                                <SelectItem value="Problème électrique / Batterie">Problème électrique / Batterie</SelectItem>
                                                <SelectItem value="Problème hydraulique">Problème hydraulique</SelectItem>
                                                <SelectItem value="Accident / Choc extérieur">Accident / Choc extérieur</SelectItem>
                                                <SelectItem value="Autre">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Gravité</Label>
                                            <Select
                                                value={formData.gravite}
                                                onValueChange={(val) => setFormData({ ...formData, gravite: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="faible">Faible (Roule)</SelectItem>
                                                    <SelectItem value="moyenne">Moyenne (Surveiller)</SelectItem>
                                                    <SelectItem value="elevee">Élevée (Arrêt)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Temps estimé</Label>
                                            <Select
                                                value={formData.temps_estime}
                                                onValueChange={(val) => setFormData({ ...formData, temps_estime: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Durée..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Moins d'une heure">Moins d'une heure</SelectItem>
                                                    <SelectItem value="2 à 4 heures">2 à 4 heures</SelectItem>
                                                    <SelectItem value="Demi-journée">Demi-journée</SelectItem>
                                                    <SelectItem value="1 jour complet">1 jour complet</SelectItem>
                                                    <SelectItem value="Plus de 2 jours">Plus de 2 jours</SelectItem>
                                                    <SelectItem value="Indéterminé">Indéterminé</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Détails de l'incident..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Causes probables</Label>
                                        <Select
                                            value={formData.causes}
                                            onValueChange={(val) => setFormData({ ...formData, causes: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Cause..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Usure normale">Usure normale</SelectItem>
                                                <SelectItem value="Mauvaise route / Nid de poule">Mauvaise route</SelectItem>
                                                <SelectItem value="Surchauffe machine">Surchauffe</SelectItem>
                                                <SelectItem value="Choc extérieur / Objet">Choc / Accident</SelectItem>
                                                <SelectItem value="Défaut pièce">Défaut pièce</SelectItem>
                                                <SelectItem value="Inconnue">Inconnue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Photo (Optionnel)</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/50 transition-all border-muted-foreground/20">
                                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                    <Camera className="w-6 h-6 mb-2 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">{formData.image ? "Fichier sélectionné" : "Ajouter une photo"}</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                                            </label>
                                        </div>
                                        {formData.image && <p className="text-xs text-emerald-600 font-medium italic truncate">Fichier : {formData.image.name}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                                    <Button type="submit" className="flex-1" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                        Envoyer le rapport
                                    </Button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Modal de détails (existant) */}
            {selectedIncident && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40 sticky top-0 bg-card z-10">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Détails de l'incident</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Signalé le {new Date(selectedIncident.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        getGraviteStyle(selectedIncident.gravite)
                                    )}>
                                        Gravité: {selectedIncident.gravite}
                                    </span>
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        getStatusStyle(selectedIncident.statut)
                                    )}>
                                        {selectedIncident.statut}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm text-foreground leading-relaxed">{selectedIncident.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Véhicule</p>
                                        <div className="flex items-center gap-2">
                                            {selectedIncident.camion ? <Truck className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                            <span className="text-sm text-foreground">
                                                {selectedIncident.camion?.matricule || selectedIncident.engin?.nom || selectedIncident.engin?.matricule || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Signalé par</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm text-foreground">{selectedIncident.signale_par?.name || selectedIncident.user?.name || 'Inconnu'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedIncident.lieu && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Lieu</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-sm text-foreground">{selectedIncident.lieu}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isAdmin && selectedIncident.statut !== 'resolu' && (
                                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                                    {selectedIncident.statut === 'ouvert' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'en_cours')}
                                            className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Prendre en charge
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleUpdateStatus(selectedIncident.id, 'resolu')}
                                        className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Marquer comme résolu
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Incidents;
