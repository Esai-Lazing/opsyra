import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Plus, Search, Pencil, Trash2, Settings, Loader2, X, Eye, Table2, LayoutGrid, User, Calendar, MoreVertical, GripVertical, ChevronLeft, ChevronRight, Fuel } from 'lucide-react';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Engins = () => {
    useDocumentTitle('Engins');
    const [engins, setEngins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingEngin, setEditingEngin] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedEngin, setSelectedEngin] = useState(null);
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
        nom: '',
        type: '',
        matricule: '',
        statut: 'en service',
        date_achat: ''
    });

    useEffect(() => {
        fetchEngins();
        fetchAssignments();
        fetchChauffeurs();
        fetchConsommations();
    }, []);

    const fetchEngins = async () => {
        try {
            const response = await api.get('/engins');
            setEngins(response.data);
        } catch (error) {
            console.error("Erreur engins", error);
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
        setEditingEngin(null);
        setFormData({ nom: '', type: '', matricule: '', statut: 'en service', date_achat: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (engin) => {
        setEditingEngin(engin);
        setFormData({
            nom: engin.nom,
            type: engin.type,
            matricule: engin.matricule,
            statut: engin.statut,
            date_achat: engin.date_achat || ''
        });
        setShowModal(true);
    };

    const handleOpenDetails = (engin) => {
        setSelectedEngin(engin);
        setDetailsModalOpen(true);
        setAssignForm(prev => ({
            ...prev,
            chauffeur_id: '',
            site_projet: '',
            date_debut: new Date().toISOString().slice(0, 10)
        }));
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.chauffeur_id || !selectedEngin) return;
        setAssignSubmitting(true);
        try {
            await api.post('/assignments', {
                user_id: assignForm.chauffeur_id,
                engin_id: selectedEngin.id,
                site_projet: assignForm.site_projet || 'N/A',
                date_debut: assignForm.date_debut,
            });
            await Promise.all([fetchAssignments(), fetchEngins()]);
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
            if (editingEngin) {
                await api.put(`/engins/${editingEngin.id}`, formData);
            } else {
                await api.post('/engins', formData);
            }
            setShowModal(false);
            fetchEngins();
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteEngin = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet engin ?')) {
            try {
                await api.delete(`/engins/${id}`);
                setEngins(engins.filter(e => e.id !== id));
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredEngins = engins.filter(e =>
        e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredEngins.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEngins = filteredEngins.slice(startIndex, endIndex);

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
        const current = [...engins];
        const sourceIndex = current.findIndex(e => e.id === sourceId);
        const targetIndex = current.findIndex(e => e.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return;
        const [moved] = current.splice(sourceIndex, 1);
        current.splice(targetIndex, 0, moved);
        setEngins(current);
        draggedId.current = null;
        setDraggingId(null);
    };

    const handleDragEnd = () => {
        draggedId.current = null;
        setDraggingId(null);
    };

    const activeAssignmentsByEngin = useMemo(() => {
        const map = {};
        assignments.forEach(a => {
            if (a.is_active && a.engin_id) {
                map[a.engin_id] = a;
            }
        });
        return map;
    }, [assignments]);

    const availableChauffeurs = useMemo(() => {
        const busyIds = new Set(assignments.filter(a => a.is_active).map(a => a.user_id));
        return chauffeurs.filter(c => !busyIds.has(c.id));
    }, [assignments, chauffeurs]);

    const filteredConsosForEngin = useMemo(() => {
        if (!selectedEngin) return [];
        return consommations.filter(c => c.engin_id === selectedEngin.id);
    }, [consommations, selectedEngin]);

    const statsForEngin = useMemo(() => {
        if (!selectedEngin) return { total: 0, count: 0, list: [] };
        let list = filteredConsosForEngin;
        if (statsDateStart) {
            list = list.filter(c => new Date(c.date_consommation) >= statsDateStart);
        }
        if (statsDateEnd) {
            list = list.filter(c => new Date(c.date_consommation) <= statsDateEnd);
        }
        const total = list.reduce((sum, c) => sum + (Number(c.quantite) || 0), 0);
        return { total, count: list.length, list: list.slice(0, 5) };
    }, [filteredConsosForEngin, statsDateStart, statsDateEnd, selectedEngin]);

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

    if (loading) return <LoadingScreen message="Chargement des engins..." />;

    return (
        <>
            <PageContainer
                title="Engins"
                description={`${filteredEngins.length} engin${filteredEngins.length > 1 ? 's' : ''} dans votre flotte`}
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
                            placeholder="Rechercher un engin..."
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
                        {paginatedEngins.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Settings className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">Aucun engin trouvé</p>
                            </div>
                        ) : (
                            paginatedEngins.map((engin, index) => (
                                <motion.div
                                    key={engin.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className={cn(
                                        "group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer",
                                        draggingId === engin.id && "opacity-70 ring-2 ring-primary/40 scale-[0.99]"
                                    )}
                                    onClick={() => handleOpenDetails(engin)}
                                    draggable
                                    onDragStart={() => handleDragStart(engin.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(engin.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                            <Settings className="h-6 w-6" />
                                        </div>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                            getStatusStyle(engin.statut)
                                        )}>
                                            <span className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                engin.statut === 'en service' && "bg-emerald-500",
                                                engin.statut === 'panne' && "bg-rose-500",
                                                engin.statut === 'maintenance' && "bg-amber-500"
                                            )} />
                                            {engin.statut}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">{engin.nom}</h3>
                                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                                {engin.matricule}
                                            </code>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border",
                                                    activeAssignmentsByEngin[engin.id]
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                                                        : "border-border/60 text-muted-foreground bg-muted/40"
                                                )}>
                                                    {activeAssignmentsByEngin[engin.id] ? "Affecté" : "Non affecté"}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border/60 text-muted-foreground bg-muted/40">
                                                    Chauffeur : {activeAssignmentsByEngin[engin.id]?.user?.name || "Non assigné"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Settings className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{engin.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {engin.date_achat ? new Date(engin.date_achat).toLocaleDateString('fr-FR') : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(engin); }}
                                            className="gap-2"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); deleteEngin(engin.id); }}
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
                                    <th className="text-left px-4 py-3">Nom</th>
                                    <th className="text-left px-4 py-3">Type</th>
                                    <th className="text-left px-4 py-3">Statut</th>
                                    <th className="text-left px-4 py-3">Date d'achat</th>
                                    <th className="text-left px-4 py-3">Affectation</th>
                                    <th className="text-left px-4 py-3">Chauffeur</th>
                                    <th className="text-left px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEngins.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-6 text-muted-foreground">Aucun engin trouvé</td>
                                    </tr>
                                ) : (
                                    paginatedEngins.map((engin) => (
                                        <tr
                                            key={engin.id}
                                            className={cn(
                                                "border-t border-border/40 hover:bg-accent/30",
                                                draggingId === engin.id && "opacity-70 ring-1 ring-primary/40"
                                            )}
                                            draggable
                                            onDragStart={() => handleDragStart(engin.id)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(engin.id)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <td className="px-3 py-3 text-muted-foreground">
                                                <GripVertical className="h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 font-mono">{engin.matricule}</td>
                                            <td className="px-4 py-3">{engin.nom}</td>
                                            <td className="px-4 py-3">{engin.type}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                                                    getStatusStyle(engin.statut)
                                                )}>
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        engin.statut === 'en service' && "bg-emerald-500",
                                                        engin.statut === 'panne' && "bg-rose-500",
                                                        engin.statut === 'maintenance' && "bg-amber-500"
                                                    )} />
                                                    {engin.statut}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {engin.date_achat ? new Date(engin.date_achat).toLocaleDateString('fr-FR') : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                    activeAssignmentsByEngin[engin.id]
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                                                        : "border-border/60 text-muted-foreground bg-muted/40"
                                                )}>
                                                    {activeAssignmentsByEngin[engin.id] ? "Affecté" : "Non affecté"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-foreground">
                                                {activeAssignmentsByEngin[engin.id]?.user?.name || "Non assigné"}
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenDetails(engin)}>
                                                            Détails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(engin)}>
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => deleteEngin(engin.id)}>
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
                {filteredEngins.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-6">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Affichage de <span className="font-medium text-foreground">{startIndex + 1}</span> à{' '}
                                <span className="font-medium text-foreground">{Math.min(endIndex, filteredEngins.length)}</span> sur{' '}
                                <span className="font-medium text-foreground">{filteredEngins.length}</span>
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

            {/* Modal de détails */}
            {detailsModalOpen && selectedEngin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40 sticky top-0 bg-card z-10">
                            <div>
                                <h2 className="text-2xl font-semibold text-foreground">{selectedEngin.nom}</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedEngin.matricule} • {selectedEngin.type}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        getStatusStyle(selectedEngin.statut)
                                    )}>
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            selectedEngin.statut === 'en service' && "bg-emerald-500",
                                            selectedEngin.statut === 'panne' && "bg-rose-500",
                                            selectedEngin.statut === 'maintenance' && "bg-amber-500"
                                        )} />
                                        {selectedEngin.statut}
                                    </span>
                                    {activeAssignmentsByEngin[selectedEngin.id] && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-200 text-emerald-700 bg-emerald-500/10">
                                            Affecté à {activeAssignmentsByEngin[selectedEngin.id].user?.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailsModalOpen(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                                    <p className="text-base font-semibold text-foreground">{selectedEngin.type}</p>
                                </div>
                                <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                    <p className="text-sm text-muted-foreground mb-1">Date d'achat</p>
                                    <p className="text-base font-semibold text-foreground">
                                        {selectedEngin.date_achat ? new Date(selectedEngin.date_achat).toLocaleDateString('fr-FR') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground">Statistiques de consommation</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <EngineScheduleDatePicker
                                            label="Date de début"
                                            value={statsDateStart}
                                            onChange={(date) => setStatsDateStart(date)}
                                            placeholder="Sélectionner une date"
                                            maxDate={statsDateEnd || new Date()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <EngineScheduleDatePicker
                                            label="Date de fin"
                                            value={statsDateEnd}
                                            onChange={(date) => setStatsDateEnd(date)}
                                            placeholder="Sélectionner une date"
                                            maxDate={new Date()}
                                            minDate={statsDateStart}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                        <p className="text-sm text-muted-foreground mb-1">Total consommé</p>
                                        <p className="text-2xl font-bold text-foreground">{statsForEngin.total.toFixed(2)} L</p>
                                    </div>
                                    <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                                        <p className="text-sm text-muted-foreground mb-1">Nombre d'opérations</p>
                                        <p className="text-2xl font-bold text-foreground">{statsForEngin.count}</p>
                                    </div>
                                </div>
                                {statsForEngin.list.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-foreground mb-2">Dernières opérations</p>
                                        <div className="space-y-2">
                                            {statsForEngin.list.map((conso) => (
                                                <div key={conso.id} className="p-3 rounded-lg border border-border/30 bg-background/60 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {new Date(conso.date_consommation).toLocaleDateString('fr-FR')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {conso.personnel?.name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-foreground">{conso.quantite} L</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-foreground">Affectation</h3>
                                </div>
                                {activeAssignmentsByEngin[selectedEngin.id] ? (
                                    <div className="p-3 rounded-lg border border-border/30 bg-background/60">
                                        <p className="text-sm text-muted-foreground mb-1">Chauffeur assigné</p>
                                        <p className="text-base font-semibold text-foreground">
                                            {activeAssignmentsByEngin[selectedEngin.id].user?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Depuis le {new Date(activeAssignmentsByEngin[selectedEngin.id].date_debut).toLocaleDateString()}
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
                    </motion.div>
                </div>
            )}

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
                                    {editingEngin ? "Modifier l'engin" : "Nouvel engin"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Renseignez les informations de l'engin
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
                                    <label className="text-sm font-medium text-foreground">Nom de l'engin</label>
                                    <input
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: Bulldozer D9"
                                        value={formData.nom}
                                        onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Type</label>
                                    <input
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        placeholder="Ex: Terrassement"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Matricule</label>
                                <input
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: ENG-2025-001"
                                    value={formData.matricule}
                                    onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Date d'achat</label>
                                    <input
                                        type="date"
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        value={formData.date_achat}
                                        onChange={e => setFormData({ ...formData, date_achat: e.target.value })}
                                    />
                                </div>
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
                                    {editingEngin ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Engins;
