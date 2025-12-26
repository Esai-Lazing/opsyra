import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Plus, Search, Pencil, Trash2, X, Loader2, Mail, Phone, Shield, Calendar, Clock, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import api from '../api/axios';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';

const Users = () => {
    useDocumentTitle('Personnel');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Chauffeur',
        telephone: '',
        adresse: '',
        date_embauche: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur personnel", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'Chauffeur',
            telephone: '',
            adresse: '',
            date_embauche: '',
        });
        setShowModal(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0]?.name || 'Chauffeur',
            telephone: user.telephone || '',
            adresse: user.adresse || '',
            date_embauche: user.date_embauche || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = [
            u.name,
            u.email,
            u.telephone,
            u.adresse
        ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchRole = filterRole === 'all' || u.roles?.[0]?.name === filterRole;
        return matchSearch && matchRole;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset à la page 1 quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    const getRoleStyle = (role) => {
        const roleMap = {
            'Admin': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
            'Sous-admin': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
            'Gestionnaire fuel': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
            'Chauffeur': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        };
        return roleMap[role] || 'bg-secondary text-muted-foreground border-border/40';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getImageUrl = (photoProfil) => {
        if (!photoProfil) return null;
        // Le backend retourne déjà l'URL complète
        // Si l'URL commence par http, on la retourne telle quelle
        if (photoProfil.startsWith('http://') || photoProfil.startsWith('https://')) {
            // Remplacer localhost par 127.0.0.1:8000 si nécessaire
            return photoProfil.replace('http://localhost/storage/', 'http://127.0.0.1:8000/storage/');
        }
        // Si ce n'est pas une URL complète, on construit l'URL vers le storage
        return `http://127.0.0.1:8000/storage/${photoProfil}`;
    };

    const roleFilters = [
        { value: 'all', label: 'Tous', count: users.length },
        { value: 'Admin', label: 'Admin', count: users.filter(u => u.roles?.[0]?.name === 'Admin').length },
        { value: 'Sous-admin', label: 'Sous-admin', count: users.filter(u => u.roles?.[0]?.name === 'Sous-admin').length },
        { value: 'Gestionnaire fuel', label: 'Gestionnaire', count: users.filter(u => u.roles?.[0]?.name === 'Gestionnaire fuel').length },
        { value: 'Chauffeur', label: 'Chauffeur', count: users.filter(u => u.roles?.[0]?.name === 'Chauffeur').length },
    ];

    if (loading) return <LoadingScreen message="Chargement du personnel..." />;

    return (
        <>
            <PageContainer
                title="Personnel"
                description={`Gestion de l'équipe et des accès utilisateurs`}
                actions={
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter un membre
                    </button>
                }
            >
                {/* Search */}
                <div className="relative mb-7">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Role Filter Tabs */}
                <Tabs value={filterRole} onValueChange={setFilterRole} className="mb-7">
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="h-auto p-1 bg-muted/30 backdrop-blur-sm border border-border/40 inline-flex w-auto">
                            {roleFilters.map((filter) => (
                                <TabsTrigger
                                    key={filter.value}
                                    value={filter.value}
                                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-3 sm:px-4 py-2 whitespace-nowrap"
                                >
                                    <span className="hidden sm:inline">{filter.label}</span>
                                    <span className="sm:hidden">{filter.label.substring(0, 3)}</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-xs font-semibold transition-colors",
                                        filterRole === filter.value
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {filter.count}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>

                {/* Table */}
                <div className="rounded-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Téléphone
                                    </th>
                                    <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Adresse
                                    </th>
                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Date d'embauche
                                    </th>
                                    <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Dernière activité
                                    </th>
                                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-accent/30 transition-colors group"
                                        >
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-sm text-primary border border-primary/20 flex-shrink-0 overflow-hidden">
                                                        {getImageUrl(user.photo_profil) ? (
                                                            <img
                                                                src={getImageUrl(user.photo_profil)}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{getInitials(user.name)}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground md:hidden truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm text-foreground truncate">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                                    <span className="text-foreground truncate">{user.telephone || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="hidden xl:table-cell px-6 py-4">
                                                <span className="text-sm text-foreground truncate block max-w-[240px]">
                                                    {user.adresse || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap",
                                                    getRoleStyle(user.roles?.[0]?.name || 'Chauffeur')
                                                )}>
                                                    <Shield className="h-3 w-3 flex-shrink-0" />
                                                    <span className="hidden sm:inline">{user.roles?.[0]?.name || 'Chauffeur'}</span>
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">
                                                        {user.date_embauche
                                                            ? new Date(user.date_embauche).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })
                                                            : '—'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden xl:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">
                                                        {user.updated_at
                                                            ? new Date(user.updated_at).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })
                                                            : '—'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Affichage de <span className="font-medium text-foreground">{startIndex + 1}</span> à{' '}
                                <span className="font-medium text-foreground">{Math.min(endIndex, filteredUsers.length)}</span> sur{' '}
                                <span className="font-medium text-foreground">{filteredUsers.length}</span>
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
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
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

                {/* Stats Footer */}
                <div className="flex items-center gap-4 flex-wrap mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-xs text-muted-foreground">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-muted-foreground">Sous-admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-500" />
                        <span className="text-xs text-muted-foreground">Gestionnaire</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-muted-foreground">Chauffeur</span>
                    </div>
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
                                    {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Renseignez les informations de l'utilisateur
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
                                <label className="text-sm font-medium text-foreground">Nom complet</label>
                                <input
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: Jean Dupont"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: jean.dupont@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: +221 77 123 45 67"
                                    value={formData.telephone}
                                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Adresse</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="Ex: 12 rue de la Paix, Dakar"
                                    value={formData.adresse}
                                    onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Date d'embauche</label>
                                <input
                                    type="date"
                                    className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    value={formData.date_embauche}
                                    onChange={e => setFormData({ ...formData, date_embauche: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Rôle</label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger className="w-full h-10 rounded-lg border-border/40 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Sous-admin">Sous-admin</SelectItem>
                                        <SelectItem value="Gestionnaire fuel">Gestionnaire fuel</SelectItem>
                                        <SelectItem value="Chauffeur">Chauffeur</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    {editingUser ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Users;
