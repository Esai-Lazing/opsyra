import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Fuel, Camera, Send, Loader2, AlertCircle, CheckCircle2, Truck, Search, Filter, Eye, X, Calendar as CalendarIcon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import authService from '../services/authService';

const RapportFuel = () => {
    // États pour les chauffeurs (soumission de rapport)
    const [submitting, setSubmitting] = useState(false);
    const [camion, setCamion] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [selectedVehicleType, setSelectedVehicleType] = useState(null);
    const [camions, setCamions] = useState([]);
    const [engins, setEngins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        quantite_restante: '',
        image: null
    });
    const [user, setUser] = useState(null);

    // États pour les admins (visualisation des rapports)
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCamion, setSelectedCamion] = useState('all');
    const [selectedChauffeur, setSelectedChauffeur] = useState('all');
    const [chauffeurs, setChauffeurs] = useState([]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        checkStatus();
    }, []);

    useEffect(() => {
        if (user?.roles?.some(r => r === 'Admin' || r === 'Sous-admin')) {
            fetchReports();
            fetchChauffeurs();
        }
    }, [user]);

    useEffect(() => {
        if (user?.roles?.some(r => r === 'Admin' || r === 'Sous-admin')) {
            filterReports();
        }
    }, [searchTerm, selectedDate, selectedCamion, selectedChauffeur, reports]);

    const checkStatus = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const isAdmin = currentUser?.roles?.some(r => r === 'Admin' || r === 'Sous-admin');

            if (isAdmin) {
                // Pour les admins, on charge juste les véhicules pour les filtres
                const [camionsRes, enginsRes] = await Promise.all([
                    api.get('/camions'),
                    api.get('/engins')
                ]);
                setCamions(camionsRes.data || []);
                setEngins(enginsRes.data || []);
            } else {
                // Pour les chauffeurs, logique normale
                const promises = [api.get('/assignments/my')];
                promises.push(api.get('/fuel/daily-report/check').catch(() => ({ data: { submitted: false } })));

                const results = await Promise.all(promises);
                const assRes = results[0];

                if (assRes.data) {
                    setCamion(assRes.data.camion || assRes.data.engin);
                }

                const statusRes = results[results.length - 1];
                if (statusRes?.data?.submitted) {
                    setAlreadySubmitted(true);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await api.get('/fuel/consommations');
            // Filtrer uniquement les rapports journaliers (quantite = 0)
            const dailyReports = response.data.filter(report => report.quantite === 0);
            setReports(dailyReports);
            setFilteredReports(dailyReports);
        } catch (error) {
            console.error('Erreur lors du chargement des rapports:', error);
        }
    };

    const fetchChauffeurs = async () => {
        try {
            const response = await api.get('/users');
            const chauffeursList = response.data.filter(u => {
                const roles = u.roles || [];
                return roles.some(r => (typeof r === 'string' ? r : r.name) === 'Chauffeur');
            });
            setChauffeurs(chauffeursList);
        } catch (error) {
            console.error('Erreur lors du chargement des chauffeurs:', error);
        }
    };

    const filterReports = () => {
        let filtered = [...reports];

        // Filtre par date
        if (selectedDate) {
            const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
            filtered = filtered.filter(report => {
                const reportDate = format(new Date(report.date_consommation), 'yyyy-MM-dd');
                return reportDate === selectedDateStr;
            });
        }

        // Filtre par camion
        if (selectedCamion && selectedCamion !== "all") {
            filtered = filtered.filter(report => {
                if (report.camion_id) {
                    return report.camion_id.toString() === selectedCamion;
                }
                return false;
            });
        }

        // Filtre par chauffeur
        if (selectedChauffeur && selectedChauffeur !== "all") {
            filtered = filtered.filter(report => {
                return report.personnel_id?.toString() === selectedChauffeur;
            });
        }

        // Filtre par recherche (matricule, nom chauffeur)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(report => {
                const camionMatricule = report.camion?.matricule?.toLowerCase() || '';
                const enginMatricule = report.engin?.matricule?.toLowerCase() || '';
                const chauffeurName = report.personnel?.name?.toLowerCase() || '';
                return camionMatricule.includes(term) || enginMatricule.includes(term) || chauffeurName.includes(term);
            });
        }

        setFilteredReports(filtered);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) return alert("L'image du compteur est obligatoire.");
        if (!camion) return alert("Veuillez sélectionner un véhicule.");

        setSubmitting(true);
        const data = new FormData();
        data.append('quantite_restante', formData.quantite_restante);
        data.append('image', formData.image);

        if (selectedVehicleId && selectedVehicleType) {
            if (selectedVehicleType === 'camion') {
                data.append('camion_id', selectedVehicleId);
            } else {
                data.append('engin_id', selectedVehicleId);
            }
        }

        try {
            await api.post('/fuel/daily-report', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAlreadySubmitted(true);
            setFormData({ quantite_restante: '', image: null });
            setImagePreview(null);
            alert('Rapport envoyé avec succès!');
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'envoi du rapport.");
        } finally {
            setSubmitting(false);
        }
    };

    const openReportModal = (report) => {
        setSelectedReport(report);
        setShowReportModal(true);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Les images sont servies via le storage Laravel (lien symbolique public/storage)
        return `http://127.0.0.1:8000/storage/${path}`;
    };

    const isAdmin = user?.roles?.some(r => r === 'Admin' || r === 'Sous-admin');
    const isChauffeur = user?.roles?.some(r => r === 'Chauffeur');
    const hasAssignment = !!camion;
    const canSelectVehicle = isAdmin && !hasAssignment;

    if (loading) return <LoadingScreen message="Chargement..." />;

    // Vue Admin : Liste des rapports
    if (isAdmin) {
        return (
            <PageContainer
                title="Rapports Journaliers de Fuel"
                description="Consultez les rapports journaliers de fuel des camions et leurs chauffeurs"
            >
                <div className="space-y-6">
                    {/* Filtres */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Recherche */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Matricule, chauffeur..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <EngineScheduleDatePicker
                                    label="Date"
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    placeholder="Sélectionner une date"
                                    maxDate={new Date()}
                                />
                            </div>

                            {/* Camion */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Camion</label>
                                <Select value={selectedCamion || "all"} onValueChange={(value) => setSelectedCamion(value === "all" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous les camions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les camions</SelectItem>
                                        {camions.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.matricule} - {c.modele}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Chauffeur */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Chauffeur</label>
                                <Select value={selectedChauffeur || "all"} onValueChange={(value) => setSelectedChauffeur(value === "all" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous les chauffeurs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les chauffeurs</SelectItem>
                                        {chauffeurs.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Boutons de réinitialisation */}
                        {(selectedDate || selectedCamion || selectedChauffeur || searchTerm) && (
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedDate(null);
                                        setSelectedCamion('all');
                                        setSelectedChauffeur('all');
                                        setSearchTerm('');
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Liste des rapports */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">
                                Rapports ({filteredReports.length})
                            </h3>
                        </div>

                        {filteredReports.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Aucun rapport trouvé</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredReports.map((report) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/50 transition-all cursor-pointer"
                                        onClick={() => openReportModal(report)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Truck className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {report.camion?.matricule || report.engin?.matricule || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {report.personnel?.name || 'Chauffeur inconnu'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-foreground">
                                                    {format(new Date(report.date_consommation), 'PPP', { locale: fr })}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {report.quantite_restante} L restants
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Modal de détails du rapport */}
                {showReportModal && selectedReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border border-border/40 rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">Détails du rapport</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowReportModal(false);
                                            setSelectedReport(null);
                                        }}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Informations générales */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <p className="text-sm text-muted-foreground mb-1">Véhicule</p>
                                            <p className="font-semibold text-foreground">
                                                {selectedReport.camion?.matricule || selectedReport.engin?.matricule || 'N/A'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedReport.camion?.modele || selectedReport.engin?.nom || ''}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <p className="text-sm text-muted-foreground mb-1">Chauffeur</p>
                                            <p className="font-semibold text-foreground">
                                                {selectedReport.personnel?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <p className="text-sm text-muted-foreground mb-1">Date</p>
                                            <p className="font-semibold text-foreground">
                                                {format(new Date(selectedReport.date_consommation), 'PPP', { locale: fr })}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <p className="text-sm text-muted-foreground mb-1">Quantité restante</p>
                                            <p className="font-semibold text-foreground text-2xl">
                                                {selectedReport.quantite_restante} L
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image du compteur */}
                                    {selectedReport.image_compteur_path && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-foreground">Photo du compteur</p>
                                            <div className="rounded-lg border border-border/40 overflow-hidden">
                                                <img
                                                    src={getImageUrl(selectedReport.image_compteur_path)}
                                                    alt="Compteur"
                                                    className="w-full h-auto max-h-96 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Métadonnées de l'image */}
                                    {selectedReport.image_metadata && (
                                        <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                                            <p className="text-sm font-medium text-foreground mb-3">Métadonnées de l'image</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {selectedReport.image_metadata.date_capture && (
                                                    <div>
                                                        <span className="text-muted-foreground">Date de capture: </span>
                                                        <span className="text-foreground">{selectedReport.image_metadata.date_capture}</span>
                                                    </div>
                                                )}
                                                {selectedReport.image_metadata.modele_appareil && (
                                                    <div>
                                                        <span className="text-muted-foreground">Appareil: </span>
                                                        <span className="text-foreground">{selectedReport.image_metadata.modele_appareil}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </PageContainer>
        );
    }

    // Vue Chauffeur : Soumission de rapport
    if (!camion && !canSelectVehicle) {
        return (
            <PageContainer title="Rapport Journalier" description="Envoyez votre niveau de carburant">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-12 text-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Affectation requise</h3>
                        <p className="text-sm text-muted-foreground">
                            Vous devez être affecté à un véhicule pour soumettre un rapport.
                        </p>
                    </motion.div>
                </div>
            </PageContainer>
        );
    }

    if (alreadySubmitted) {
        return (
            <PageContainer title="Rapport Journalier" description="Envoyez votre niveau de carburant">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-12 text-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Rapport déjà envoyé</h3>
                        <p className="text-sm text-muted-foreground">
                            Vous avez déjà soumis votre rapport aujourd'hui. Prochain rapport demain.
                        </p>
                    </motion.div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Rapport Journalier"
            description="Envoyez votre niveau de carburant quotidien"
        >
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-8"
                >
                    {/* Véhicule assigné ou sélectionné */}
                    {camion ? (
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Véhicule assigné</p>
                                <p className="text-lg font-semibold text-foreground">
                                    {camion.matricule} - {camion.modele || camion.nom}
                                </p>
                            </div>
                        </div>
                    ) : canSelectVehicle ? (
                        <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sélectionner un véhicule</p>
                                    <p className="text-xs text-muted-foreground">En tant qu'admin, vous pouvez sélectionner un véhicule</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Type de véhicule</label>
                                    <Select value={selectedVehicleType || ''} onValueChange={(value) => {
                                        setSelectedVehicleType(value);
                                        setSelectedVehicleId(null);
                                        setCamion(null);
                                    }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="camion">Camion</SelectItem>
                                            <SelectItem value="engin">Engin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Véhicule</label>
                                    <Select
                                        value={selectedVehicleId || ''}
                                        onValueChange={(value) => {
                                            setSelectedVehicleId(value);
                                            const vehicle = selectedVehicleType === 'camion'
                                                ? camions.find(c => c.id.toString() === value)
                                                : engins.find(e => e.id.toString() === value);
                                            if (vehicle) {
                                                setCamion(vehicle);
                                            }
                                        }}
                                        disabled={!selectedVehicleType}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un véhicule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedVehicleType === 'camion' && camions.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.matricule} - {c.modele}
                                                </SelectItem>
                                            ))}
                                            {selectedVehicleType === 'engin' && engins.map(e => (
                                                <SelectItem key={e.id} value={e.id.toString()}>
                                                    {e.matricule} - {e.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Quantité restante (Litres)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                className="w-full h-12 px-4 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                placeholder="Ex: 85.5"
                                value={formData.quantite_restante}
                                onChange={e => setFormData({ ...formData, quantite_restante: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Photo du compteur
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    className="hidden"
                                    id="image-upload"
                                    onChange={handleImageChange}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/40 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                                    ) : (
                                        <>
                                            <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium text-foreground">Cliquez pour ajouter une photo</p>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 10MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !camion}
                            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Envoyer le rapport
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </PageContainer>
    );
};

export default RapportFuel;
