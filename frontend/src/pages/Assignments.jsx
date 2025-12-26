import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Plus, Search, User, Truck, Settings, MapPin, Calendar, X, Loader2, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import api from '../api/axios';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [camions, setCamions] = useState([]);
    const [engins, setEngins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        type: 'camion',
        camion_id: '',
        engin_id: '',
        user_id: '',
        site_projet: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        is_active: true
    });

    // Identifiants déjà occupés (en excluant l'affectation en cours d'édition)
    const activeUserIds = assignments
        .filter(a => a.is_active && a.id !== editingAssignment?.id)
        .map(a => a.user_id);
    const activeCamionIds = assignments
        .filter(a => a.is_active && a.id !== editingAssignment?.id)
        .map(a => a.camion_id);
    const activeEnginIds = assignments
        .filter(a => a.is_active && a.id !== editingAssignment?.id)
        .map(a => a.engin_id);

    // Filtrer les éléments disponibles
    const availableCamions = camions.filter(c => !activeCamionIds.includes(c.id));
    const availableEngins = engins.filter(e => !activeEnginIds.includes(e.id));
    const availableChauffeurs = users.filter(u =>
        u.roles?.some(r => r.name === 'Chauffeur') &&
        !activeUserIds.includes(u.id)
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assRes, camRes, engRes, userRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/camions'),
                api.get('/engins'),
                api.get('/users')
            ]);
            setAssignments(assRes.data);
            setCamions(camRes.data);
            setEngins(engRes.data);
            setUsers(userRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingAssignment(null);
        // Sélectionner automatiquement les premiers éléments disponibles
        const firstAvailableCamion = availableCamions[0]?.id?.toString() || '';
        const firstAvailableChauffeur = availableChauffeurs[0]?.id?.toString() || '';

        setFormData({
            type: 'camion',
            camion_id: firstAvailableCamion,
            engin_id: '',
            user_id: firstAvailableChauffeur,
            site_projet: '',
            date_debut: new Date().toISOString().split('T')[0],
            date_fin: '',
            is_active: true
        });
        setShowModal(true);
    };

    const handleOpenEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            type: assignment.camion ? 'camion' : 'engin',
            camion_id: assignment.camion_id?.toString() || '',
            engin_id: assignment.engin_id?.toString() || '',
            user_id: assignment.user_id?.toString() || '',
            site_projet: assignment.site_projet || '',
            date_debut: assignment.date_debut || new Date().toISOString().split('T')[0],
            date_fin: assignment.date_fin || '',
            is_active: assignment.is_active ?? true
        });
        setShowModal(true);
    };

    const handleTerminate = async (id) => {
        if (window.confirm('Voulez-vous terminer cette affectation ?')) {
            try {
                const assignment = assignments.find(a => a.id === id);
                if (!assignment) return;

                const updateData = {
                    type: assignment.camion ? 'camion' : 'engin',
                    camion_id: assignment.camion_id,
                    engin_id: assignment.engin_id,
                    user_id: assignment.user_id,
                    site_projet: assignment.site_projet,
                    date_debut: assignment.date_debut,
                    date_fin: new Date().toISOString().split('T')[0],
                    is_active: false
                };

                await api.put(`/assignments/${id}`, updateData);
                fetchData();
            } catch (error) {
                console.error("Erreur détails:", error.response?.data);
                alert(error.response?.data?.message || "Erreur lors de la terminaison de l'affectation");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingAssignment) {
                await api.put(`/assignments/${editingAssignment.id}`, formData);
            } else {
                await api.post('/assignments', formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteAssignment = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette affectation ?')) {
            try {
                await api.delete(`/assignments/${id}`);
                fetchData();
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredAssignments = assignments.filter(a =>
        a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.camion?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.engin?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen message="Chargement des affectations..." />;

    return (
        <>
            <PageContainer
                title="Affectations"
                description={`${filteredAssignments.length} affectation${filteredAssignments.length > 1 ? 's' : ''} active${filteredAssignments.length > 1 ? 's' : ''}`}
                actions={
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle affectation
                    </button>
                }
            >
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher une affectation par nom, matricule ou site..."
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssignments.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <User className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Aucune affectation trouvée</p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary border border-primary/20 overflow-hidden">
                                            {assignment.user?.photo_profil ? (
                                                <img 
                                                    src={assignment.user.photo_profil.startsWith('http') 
                                                        ? assignment.user.photo_profil 
                                                        : assignment.user.photo_profil.startsWith('storage/')
                                                        ? `http://127.0.0.1:8000/${assignment.user.photo_profil}`
                                                        : `http://127.0.0.1:8000/storage/${assignment.user.photo_profil}`} 
                                                    alt={assignment.user?.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{assignment.user?.name?.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">{assignment.user?.name}</h3>
                                            <p className="text-xs text-muted-foreground">{assignment.user?.email}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                        assignment.is_active
                                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                            : "bg-muted text-muted-foreground border-border/40"
                                    )}>
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            assignment.is_active ? "bg-emerald-500" : "bg-muted-foreground"
                                        )} />
                                        {assignment.is_active ? 'Active' : 'Terminée'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        {assignment.camion ? <Truck className="h-4 w-4 text-muted-foreground" /> : <Settings className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-foreground font-medium">
                                            {assignment.camion ? assignment.camion.matricule : assignment.engin?.nom}
                                        </span>
                                    </div>
                                    {assignment.site_projet && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{assignment.site_projet}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            Depuis le {new Date(assignment.date_debut).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                                    <button
                                        onClick={() => handleOpenEdit(assignment)}
                                        className="flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Modifier
                                    </button>
                                    {assignment.is_active && (
                                        <button
                                            onClick={() => handleTerminate(assignment.id)}
                                            className="flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Terminer
                                        </button>
                                    )}
                                    {!assignment.is_active && (
                                        <button
                                            onClick={() => deleteAssignment(assignment.id)}
                                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        ))
                    )}
                </div>
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
                                    {editingAssignment ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {editingAssignment
                                        ? 'Modifiez les détails de l\'affectation'
                                        : 'Assignez un conducteur à un véhicule'
                                    }
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Type de véhicule</label>
                                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger className="w-full h-10 rounded-lg border-border/40 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                        <SelectItem value="camion">Camion</SelectItem>
                                        <SelectItem value="engin">Engin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.type === 'camion' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Camion</label>
                                    <Select
                                        value={formData.camion_id}
                                        onValueChange={(value) => setFormData({ ...formData, camion_id: value })}
                                    >
                                        <SelectTrigger className="w-full h-10 rounded-lg border-border/40 bg-background/50">
                                            <SelectValue placeholder="Sélectionner un camion" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[150]">
                                            {availableCamions.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    Aucun camion disponible
                                                </div>
                                            ) : (
                                                availableCamions.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.matricule} - {c.modele}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Engin</label>
                                    <Select
                                        value={formData.engin_id}
                                        onValueChange={(value) => setFormData({ ...formData, engin_id: value })}
                                    >
                                        <SelectTrigger className="w-full h-10 rounded-lg border-border/40 bg-background/50">
                                            <SelectValue placeholder="Sélectionner un engin" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[150]">
                                            {availableEngins.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    Aucun engin disponible
                                                </div>
                                            ) : (
                                                availableEngins.map(e => (
                                                    <SelectItem key={e.id} value={e.id.toString()}>
                                                        {e.nom} - {e.matricule}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Conducteur</label>
                                <Select
                                    value={formData.user_id}
                                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                                >
                                    <SelectTrigger className="w-full h-10 rounded-lg border-border/40 bg-background/50">
                                        <SelectValue placeholder="Sélectionner un conducteur" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                        {availableChauffeurs.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                Aucun chauffeur disponible
                                            </div>
                                        ) : (
                                            availableChauffeurs.map(u => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Site / Projet</label>
                                <input
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: Chantier Nord"
                                    value={formData.site_projet}
                                    onChange={e => setFormData({ ...formData, site_projet: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Date de début</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        value={formData.date_debut}
                                        onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                                    />
                                </div>

                                {editingAssignment && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Date de fin (optionnel)</label>
                                        <input
                                            type="date"
                                            className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                            value={formData.date_fin}
                                            onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                                            min={formData.date_debut}
                                        />
                                    </div>
                                )}
                            </div>

                            {editingAssignment && (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/40">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 rounded border-border/40 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
                                        Affectation active
                                    </label>
                                    <p className="text-xs text-muted-foreground ml-auto">
                                        {formData.is_active ? 'En cours' : 'Terminée'}
                                    </p>
                                </div>
                            )}

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
                                    {editingAssignment ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Assignments;
