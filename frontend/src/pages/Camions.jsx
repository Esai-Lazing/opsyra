import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Plus, Search, Pencil, Trash2, Truck, Gauge, Fuel, X, Loader2, Eye, Table2, LayoutGrid, User, Calendar, ArrowDownCircle, MoreVertical, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Camions = () => {
    const [camions, setCamions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingCamion, setEditingCamion] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCamion, setSelectedCamion] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [chauffeurs, setChauffeurs] = useState([]);
    const [consommations, setConsommations] = useState([]);
    const [assignForm, setAssignForm] = useState({
        chauffeur_id: '',
        site_projet: '',
        date_debut: new Date().toISOString().slice(0, 10),
    });
    const [assignSubmitting, setAssignSubmitting] = useState(false);
    const [statsDateStart, setStatsDateStart] = useState(null);
    const [statsDateEnd, setStatsDateEnd] = useState(null);
    const draggedId = useRef(null);
    const [draggingId, setDraggingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    const [formData, setFormData] = useState({
        matricule: '',
        modele: '',
        capacite: '',
        consommation_moyenne: '',
        statut: 'en service'
    });

    useEffect(() => {
        fetchCamions();
        fetchAssignments();
        fetchChauffeurs();
        fetchConsommations();
    }, []);

    const fetchCamions = async () => {
        try {
            const response = await api.get('/camions');
            setCamions(response.data);
        } catch (error) {
            console.error("Erreur camions", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/assignments');
            setAssignments(response.data);
        } catch (error) {
            console.error("Erreur assignments", error);
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
            console.error("Erreur chauffeurs", error);
        }
    };

    const fetchConsommations = async () => {
        try {
            const response = await api.get('/fuel/consommations');
            setConsommations(response.data || []);
        } catch (error) {
            console.error("Erreur consommations", error);
        }
    };

    const handleOpenCreate = () => {
        setEditingCamion(null);
        setFormData({ matricule: '', modele: '', capacite: '', consommation_moyenne: '', statut: 'en service' });
        setShowModal(true);
    };

    const handleOpenEdit = (camion) => {
        setEditingCamion(camion);
        setFormData({
            matricule: camion.matricule,
            modele: camion.modele,
            capacite: camion.capacite,
            consommation_moyenne: camion.consommation_moyenne,
            statut: camion.statut
        });
        setShowModal(true);
    };

    const handleOpenDetails = (camion) => {
        setSelectedCamion(camion);
        setDetailsModalOpen(true);
        // Prépare formulaire d'affectation
        setAssignForm(prev => ({
            ...prev,
            chauffeur_id: '',
            site_projet: '',
            date_debut: new Date().toISOString().slice(0, 10)
        }));
    };


    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.chauffeur_id || !selectedCamion) return;
        setAssignSubmitting(true);
        try {
            await api.post('/assignments', {
                user_id: assignForm.chauffeur_id,
                camion_id: selectedCamion.id,
                site_projet: assignForm.site_projet || 'N/A',
                date_debut: assignForm.date_debut,
            });
            await Promise.all([fetchAssignments(), fetchCamions()]);
            setDetailsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'affectation");
        } finally {
            setAssignSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCamion) {
                await api.put(`/camions/${editingCamion.id}`, formData);
            } else {
                await api.post('/camions', formData);
            }
            setShowModal(false);
            fetchCamions();
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCamion = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce camion ?')) {
            try {
                await api.delete(`/camions/${id}`);
                setCamions(camions.filter(c => c.id !== id));
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredCamions = camions.filter(c =>
        c.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCamions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCamions = filteredCamions.slice(startIndex, endIndex);

    // Reset à la page 1 quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Drag & Drop helpers
    const handleDragStart = (id) => {
        draggedId.current = id;
        setDraggingId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (targetId) => {
        const sourceId = draggedId.current;
        if (!sourceId || sourceId === targetId) return;
        const current = [...camions];
        const sourceIndex = current.findIndex(c => c.id === sourceId);
        const targetIndex = current.findIndex(c => c.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return;
        const [moved] = current.splice(sourceIndex, 1);
        current.splice(targetIndex, 0, moved);
        setCamions(current);
        draggedId.current = null;
        setDraggingId(null);
    };

    const handleDragEnd = () => {
        draggedId.current = null;
        setDraggingId(null);
    };

    const activeAssignmentsByCamion = useMemo(() => {
        const map = {};
        assignments.forEach(a => {
            if (a.is_active && a.camion_id) {
                map[a.camion_id] = a;
            }
        });
        return map;
    }, [assignments]);

    const availableChauffeurs = useMemo(() => {
        const busyIds = new Set(assignments.filter(a => a.is_active).map(a => a.user_id));
        return chauffeurs.filter(c => !busyIds.has(c.id));
    }, [assignments, chauffeurs]);

    const filteredConsosForCamion = useMemo(() => {
        if (!selectedCamion) return [];
        return consommations.filter(c => c.camion_id === selectedCamion.id);
    }, [consommations, selectedCamion]);

    const statsForCamion = useMemo(() => {
        if (!selectedCamion) return { total: 0, count: 0, list: [] };
        let list = filteredConsosForCamion;
        if (statsDateStart) {
            list = list.filter(c => new Date(c.date_consommation) >= statsDateStart);
        }
        if (statsDateEnd) {
            list = list.filter(c => new Date(c.date_consommation) <= statsDateEnd);
        }
        const total = list.reduce((sum, c) => sum + (Number(c.quantite) || 0), 0);
        return { total, count: list.length, list: list.slice(0, 5) };
    }, [filteredConsosForCamion, statsDateStart, statsDateEnd, selectedCamion]);

    const getStatusStyle = (statut) => {
        switch (statut) {
            case 'en service':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'panne':
                return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
            case 'maintenance':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            default:
                return 'bg-secondary text-muted-foreground border-border/40';
        }
    };

    if (loading) return <LoadingScreen message="Chargement des camions..." />;

    return (
        <>
            <PageContainer
                title="Camions"
                description={`${filteredCamions.length} camion${filteredCamions.length > 1 ? 's' : ''} dans votre flotte`}
                actions={
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </button>
                }
            >
                {/* Barre de recherche et vue */}
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher un camion..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Grille
                        </Button>
                        <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
                            <Table2 className="h-4 w-4 mr-2" />
                            Tableau
                        </Button>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCamions.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Truck className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">Aucun camion trouvé</p>
                            </div>
                        ) : (
                            paginatedCamions.map((camion, index) => (
                                <motion.div
                                    key={camion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className={cn(
                                        "group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer",
                                        draggingId === camion.id && "opacity-70 ring-2 ring-primary/40 scale-[0.99]"
                                    )}
                                    onClick={() => handleOpenDetails(camion)}
                                    draggable
                                    onDragStart={() => handleDragStart(camion.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(camion.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                            getStatusStyle(camion.statut)
                                        )}>
                                            <span className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                camion.statut === 'en service' && "bg-emerald-500",
                                                camion.statut === 'panne' && "bg-rose-500",
                                                camion.statut === 'maintenance' && "bg-amber-500"
                                            )} />
                                            {camion.statut}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">{camion.modele}</h3>
                                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                                {camion.matricule}
                                            </code>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border",
                                                    activeAssignmentsByCamion[camion.id]
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                                                        : "border-border/60 text-muted-foreground bg-muted/40"
                                                )}>
                                                    {activeAssignmentsByCamion[camion.id] ? "Affecté" : "Non affecté"}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border/60 text-muted-foreground bg-muted/40">
                                                    Chauffeur : {activeAssignmentsByCamion[camion.id]?.user?.name || "Non assigné"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{camion.capacite}T</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Fuel className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{camion.consommation_moyenne}L/100km</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(camion); }}
                                            className="gap-2"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); deleteCamion(camion.id); }}
                                            className="gap-2 text-destructive hover:text-destructive border-destructive/40 hover:border-destructive/60"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Supprimer
                                        </Button>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-auto rounded-xl border border-border/40">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-3 py-3"></th>
                                    <th className="text-left px-4 py-3">Matricule</th>
                                    <th className="text-left px-4 py-3">Modèle</th>
                                    <th className="text-left px-4 py-3">Capacité</th>
                                    <th className="text-left px-4 py-3">Conso</th>
                                    <th className="text-left px-4 py-3">Statut</th>
                                    <th className="text-left px-4 py-3">Affectation</th>
                                    <th className="text-left px-4 py-3">Chauffeur</th>
                                    <th className="text-left px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCamions.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-6 text-muted-foreground">Aucun camion trouvé</td>
                                    </tr>
                                ) : (
                                    paginatedCamions.map((camion) => (
                                        <tr
                                            key={camion.id}
                                            className={cn(
                                                "border-t border-border/40 hover:bg-accent/30",
                                                draggingId === camion.id && "opacity-70 ring-1 ring-primary/40"
                                            )}
                                            draggable
                                            onDragStart={() => handleDragStart(camion.id)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(camion.id)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <td className="px-3 py-3 text-muted-foreground">
                                                <GripVertical className="h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 font-mono">{camion.matricule}</td>
                                            <td className="px-4 py-3">{camion.modele}</td>
                                            <td className="px-4 py-3">{camion.capacite}T</td>
                                            <td className="px-4 py-3">{camion.consommation_moyenne}L/100km</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                                                    getStatusStyle(camion.statut)
                                                )}>
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        camion.statut === 'en service' && "bg-emerald-500",
                                                        camion.statut === 'panne' && "bg-rose-500",
                                                        camion.statut === 'maintenance' && "bg-amber-500"
                                                    )} />
                                                    {camion.statut}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                    activeAssignmentsByCamion[camion.id]
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                                                        : "border-border/60 text-muted-foreground bg-muted/40"
                                                )}>
                                                    {activeAssignmentsByCamion[camion.id] ? "Affecté" : "Non affecté"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-foreground">
                                                {activeAssignmentsByCamion[camion.id]?.user?.name || "Non assigné"}
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenDetails(camion)}>
                                                            Détails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(camion)}>
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCamion(camion.id)}>
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {filteredCamions.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-6">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Affichage de <span className="font-medium text-foreground">{startIndex + 1}</span> à{' '}
                                <span className="font-medium text-foreground">{Math.min(endIndex, filteredCamions.length)}</span> sur{' '}
                                <span className="font-medium text-foreground">{filteredCamions.length}</span>
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
                                        // Afficher 5 pages max : première, dernière, et 3 autour de la page courante
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



            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {editingCamion ? "Modifier le camion" : "Nouveau camion"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Renseignez les informations du camion
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Matricule</label>
                                    <input
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: CAM-2025-001"
                                        value={formData.matricule}
                                        onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Modèle</label>
                                    <input
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: Mercedes Actros"
                                        value={formData.modele}
                                        onChange={e => setFormData({ ...formData, modele: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Capacité (Tonnes)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: 25"
                                        value={formData.capacite}
                                        onChange={e => setFormData({ ...formData, capacite: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Consommation (L/100km)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: 28.5"
                                        value={formData.consommation_moyenne}
                                        onChange={e => setFormData({ ...formData, consommation_moyenne: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Statut</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    value={formData.statut}
                                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                                >
                                    <option value="en service">En service</option>
                                    <option value="panne">En panne</option>
                                    <option value="maintenance">En maintenance</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-10 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingCamion ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal détails camion */}
            {detailsModalOpen && selectedCamion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold text-foreground">Détails du camion</h2>
                                <p className="text-sm text-muted-foreground">{selectedCamion.matricule} · {selectedCamion.modele}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        activeAssignmentsByCamion[selectedCamion.id]
                                            ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                                            : "border-border/60 text-muted-foreground bg-muted/40"
                                    )}>
                                        {activeAssignmentsByCamion[selectedCamion.id] ? "Affectation active" : "Aucune affectation"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border/60 text-muted-foreground bg-muted/40">
                                        Chauffeur : {activeAssignmentsByCamion[selectedCamion.id]?.user?.name || "Non assigné"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailsModalOpen(false)}
                                className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Infos principales */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="rounded-xl border border-border/40 p-4 bg-muted/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Camion</p>
                                            <p className="text-lg font-semibold text-foreground">{selectedCamion.modele}</p>
                                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                                {selectedCamion.matricule}
                                            </code>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-3 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Capacité</p>
                                            <p className="text-base font-semibold text-foreground">{selectedCamion.capacite} T</p>
                                        </div>
                                        <div className="p-3 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Conso. moyenne</p>
                                            <p className="text-base font-semibold text-foreground">{selectedCamion.consommation_moyenne} L/100km</p>
                                        </div>
                                        <div className="p-3 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Statut</p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                                getStatusStyle(selectedCamion.statut)
                                            )}>
                                                <span className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    selectedCamion.statut === 'en service' && "bg-emerald-500",
                                                    selectedCamion.statut === 'panne' && "bg-rose-500",
                                                    selectedCamion.statut === 'maintenance' && "bg-amber-500"
                                                )} />
                                                {selectedCamion.statut}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistiques de consommation */}
                                <div className="rounded-xl border border-border/40 p-4 bg-muted/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Fuel className="h-5 w-5 text-primary" />
                                            <h3 className="text-base font-semibold text-foreground">Consommation de fuel</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <EngineScheduleDatePicker
                                            label="Date début"
                                            value={statsDateStart}
                                            onChange={(date) => setStatsDateStart(date)}
                                            maxDate={statsDateEnd || new Date()}
                                        />
                                        <EngineScheduleDatePicker
                                            label="Date fin"
                                            value={statsDateEnd}
                                            onChange={(date) => setStatsDateEnd(date)}
                                            minDate={statsDateStart}
                                            maxDate={new Date()}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Total consommé</p>
                                            <p className="text-2xl font-semibold text-foreground">{statsForCamion.total.toFixed(1)} L</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Nombre d'opérations</p>
                                            <p className="text-2xl font-semibold text-foreground">{statsForCamion.count}</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-xs text-muted-foreground">Moyenne</p>
                                            <p className="text-2xl font-semibold text-foreground">
                                                {statsForCamion.count ? (statsForCamion.total / statsForCamion.count).toFixed(1) : '0.0'} L
                                            </p>
                                        </div>
                                    </div>

                                    {statsForCamion.list.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-foreground">Dernières opérations</p>
                                            <div className="space-y-2">
                                                {statsForCamion.list.map(op => (
                                                    <div key={op.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <ArrowDownCircle className="h-4 w-4 text-primary" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">{op.quantite} L</p>
                                                                <p className="text-xs text-muted-foreground">{new Date(op.date_consommation).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{op.personnel?.name || 'N/A'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Affectation / Chauffeur */}
                            <div className="space-y-4">
                                <div className="rounded-xl border border-border/40 p-4 bg-muted/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="h-5 w-5 text-primary" />
                                        <h3 className="text-base font-semibold text-foreground">Affectation</h3>
                                    </div>
                                    {activeAssignmentsByCamion[selectedCamion.id] ? (
                                        <div className="p-3 rounded-lg border border-border/30 bg-background/60">
                                            <p className="text-sm text-muted-foreground mb-1">Chauffeur assigné</p>
                                            <p className="text-base font-semibold text-foreground">
                                                {activeAssignmentsByCamion[selectedCamion.id].user?.name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Depuis le {new Date(activeAssignmentsByCamion[selectedCamion.id].date_debut).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <form className="space-y-3" onSubmit={handleAssign}>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-foreground">Chauffeur disponible</label>
                                                <Select
                                                    value={assignForm.chauffeur_id}
                                                    onValueChange={(v) => setAssignForm({ ...assignForm, chauffeur_id: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner un chauffeur" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableChauffeurs.length === 0 && (
                                                            <SelectItem value="none" disabled>Aucun chauffeur disponible</SelectItem>
                                                        )}
                                                        {availableChauffeurs.map(c => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-foreground">Site / Projet</label>
                                                <Input
                                                    placeholder="Ex: Base A"
                                                    value={assignForm.site_projet}
                                                    onChange={(e) => setAssignForm({ ...assignForm, site_projet: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-foreground">Date de début</label>
                                                <Input
                                                    type="date"
                                                    value={assignForm.date_debut instanceof Date ? assignForm.date_debut.toISOString().slice(0, 10) : assignForm.date_debut}
                                                    onChange={(e) => setAssignForm({ ...assignForm, date_debut: e.target.value })}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={assignSubmitting || availableChauffeurs.length === 0}>
                                                {assignSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Affecter"}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

        </>
    );
};

export default Camions;
