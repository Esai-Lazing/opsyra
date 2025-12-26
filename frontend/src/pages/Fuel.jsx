import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Plus, Fuel as FuelIcon, TrendingUp, TrendingDown, Truck, User, Calendar, ArrowUpRight, ArrowDownRight, Search, X, Loader2 } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker';

// Helper function pour normaliser une date au format YYYY-MM-DD (fuseau horaire local)
const normalizeDateToString = (date) => {
    if (!date) return null;

    let d;
    if (typeof date === 'string') {
        // Si c'est déjà une string au format YYYY-MM-DD, la retourner telle quelle
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return date;
        }
        d = new Date(date);
    } else {
        d = new Date(date);
    }

    // Utiliser les méthodes locales pour éviter les problèmes de fuseau horaire
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const Fuel = () => {
    const [stock, setStock] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [camions, setCamions] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('month'); // 'all', 'week', 'month', 'year'
    const [showStockModal, setShowStockModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
    const [showStockInfoModal, setShowStockInfoModal] = useState(false);
    const [showApprovisionnementsModal, setShowApprovisionnementsModal] = useState(false);
    const [showConsommationsModal, setShowConsommationsModal] = useState(false);
    const [selectedDateAppro, setSelectedDateAppro] = useState(new Date());
    const [selectedDateConso, setSelectedDateConso] = useState(new Date());
    const [calendarOpenAppro, setCalendarOpenAppro] = useState(false);
    const [calendarOpenConso, setCalendarOpenConso] = useState(false);
    const [calendarOpenStock, setCalendarOpenStock] = useState(false);
    const [calendarOpenLoad, setCalendarOpenLoad] = useState(false);
    const [displayedItemsAppro, setDisplayedItemsAppro] = useState(10);
    const [displayedItemsConso, setDisplayedItemsConso] = useState(10);
    const approScrollRef = useRef(null);
    const consoScrollRef = useRef(null);

    // Réinitialiser les compteurs quand on change de date ou qu'on ouvre/ferme les modals
    useEffect(() => {
        if (!showApprovisionnementsModal) {
            setDisplayedItemsAppro(10);
        }
    }, [showApprovisionnementsModal, selectedDateAppro]);

    useEffect(() => {
        if (!showConsommationsModal) {
            setDisplayedItemsConso(10);
        }
    }, [showConsommationsModal, selectedDateConso]);
    const [submitting, setSubmitting] = useState(false);
    const [allTransactionsPage, setAllTransactionsPage] = useState(1);
    const [allTransactionsLoading, setAllTransactionsLoading] = useState(false);
    const [allTransactionsHasMore, setAllTransactionsHasMore] = useState(true);
    const [allTransactionsFilter, setAllTransactionsFilter] = useState({
        search: '',
        type: 'all',
        period: 'all'
    });
    const [stockErrors, setStockErrors] = useState({});
    const [loadErrors, setLoadErrors] = useState({});

    const [stockFormData, setStockFormData] = useState({
        quantite: '',
        date_approvisionnement: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [loadFormData, setLoadFormData] = useState({
        camion_id: '',
        personnel_id: '',
        quantite: '',
        date_consommation: new Date().toISOString().split('T')[0]
    });

    const handleCloseLoadModal = () => {
        setShowLoadModal(false);
        setLoadFormData({
            camion_id: '',
            personnel_id: '',
            quantite: '',
            date_consommation: new Date().toISOString().split('T')[0]
        });
        setLoadErrors({});
    };

    const [allConsommations, setAllConsommations] = useState([]);
    const [allApprovisionnements, setAllApprovisionnements] = useState([]);

    // Fonction pour calculer les statistiques selon la période
    const calculateStatsByPeriod = (consommations, approvisionnements, period) => {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Début de la semaine (dimanche)
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default: // 'all'
                startDate = new Date(0); // Toutes les dates
        }

        const consommationsFiltered = period === 'all'
            ? consommations
            : consommations.filter(c => {
                const dateConso = new Date(c.date_consommation);
                return dateConso >= startDate;
            });

        const approvisionnementsFiltered = period === 'all'
            ? approvisionnements
            : approvisionnements.filter(a => {
                const dateAppro = new Date(a.date_approvisionnement);
                return dateAppro >= startDate;
            });

        const totalApprovisionnements = approvisionnementsFiltered.reduce((sum, a) => sum + (parseFloat(a.quantite) || 0), 0);
        const totalConsommations = consommationsFiltered.reduce((sum, c) => sum + (parseFloat(c.quantite) || 0), 0);

        return { totalApprovisionnements, totalConsommations };
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Recalculer les statistiques quand la période change
    useEffect(() => {
        if (allConsommations.length > 0 || allApprovisionnements.length > 0) {
            const stats = calculateStatsByPeriod(allConsommations, allApprovisionnements, periodFilter);
            setStock(prev => prev ? {
                ...prev,
                total_approvisionnements: stats.totalApprovisionnements,
                total_consommations: stats.totalConsommations
            } : null);
        }
    }, [periodFilter, allConsommations, allApprovisionnements]);

    const fetchData = async () => {
        try {
            const [stockRes, transRes, replenRes, camRes, userRes, assignmentsRes] = await Promise.all([
                api.get('/fuel/stock'),
                api.get('/fuel/consommations'),
                api.get('/fuel/replenishments'),
                api.get('/camions'),
                api.get('/users'),
                api.get('/assignments')
            ]);

            // Calculer les statistiques selon la période sélectionnée
            const stats = calculateStatsByPeriod(transRes.data, replenRes.data, periodFilter);

            // Calculer le stock actuel : utiliser quantite_totale de la base (qui est déjà mis à jour)
            const stockActuel = stockRes.data?.quantite_totale || 0;

            // Enrichir les données du stock avec les statistiques calculées
            const stockData = {
                ...stockRes.data,
                quantite_stock: stockActuel,
                total_approvisionnements: stats.totalApprovisionnements,
                total_consommations: stats.totalConsommations
            };

            setStock(stockData);

            // Stocker toutes les données pour les recalculs
            setAllConsommations(transRes.data);
            setAllApprovisionnements(replenRes.data);

            // Combiner les consommations et les approvisionnements
            const consommations = transRes.data.map(c => ({
                ...c,
                type: 'consommation',
                date: c.date_consommation,
                uniqueKey: `consommation-${c.id}`
            }));

            const approvisionnements = replenRes.data.map(a => ({
                ...a,
                type: 'approvisionnement',
                date: a.date_approvisionnement,
                date_consommation: a.date_approvisionnement,
                date_approvisionnement: a.date_approvisionnement,
                uniqueKey: `approvisionnement-${a.id}`
            }));

            // Combiner et trier par date (plus récent en premier)
            const allTransactions = [...consommations, ...approvisionnements].sort((a, b) => {
                const dateA = new Date(a.date || a.date_consommation || a.date_approvisionnement);
                const dateB = new Date(b.date || b.date_consommation || b.date_approvisionnement);
                return dateB - dateA;
            });

            setTransactions(allTransactions);
            setCamions(camRes.data);
            setUsers(userRes.data);
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStockErrors({});
        try {
            const dataToSend = {
                quantite: parseFloat(stockFormData.quantite),
                date_approvisionnement: stockFormData.date_approvisionnement,
                notes: stockFormData.notes || null
            };
            await api.post('/fuel/replenishments', dataToSend);
            setShowStockModal(false);
            setStockFormData({
                quantite: '',
                date_approvisionnement: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setStockErrors({});
            fetchData();
        } catch (error) {
            console.error("Erreur détails:", error.response?.data);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const formattedErrors = {};

                // Mapper les erreurs de l'API aux champs du formulaire
                if (errors.quantite) {
                    formattedErrors.quantite = Array.isArray(errors.quantite)
                        ? errors.quantite[0]
                        : errors.quantite;
                }
                if (errors.date_approvisionnement) {
                    formattedErrors.date_approvisionnement = Array.isArray(errors.date_approvisionnement)
                        ? errors.date_approvisionnement[0]
                        : errors.date_approvisionnement;
                }
                if (errors.notes) {
                    formattedErrors.notes = Array.isArray(errors.notes)
                        ? errors.notes[0]
                        : errors.notes;
                }

                setStockErrors(formattedErrors);
            } else {
                alert(error.response?.data?.message || "Erreur lors de l'approvisionnement");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoadSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setLoadErrors({});
        try {
            const dataToSend = {
                camion_id: parseInt(loadFormData.camion_id),
                personnel_id: parseInt(loadFormData.personnel_id),
                quantite: parseFloat(loadFormData.quantite),
                date_consommation: loadFormData.date_consommation,
                type: 'consommation'
            };
            await api.post('/fuel/consommations', dataToSend);
            handleCloseLoadModal();
            fetchData();
        } catch (error) {
            console.error("Erreur détails:", error.response?.data);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const formattedErrors = {};

                if (errors.camion_id) {
                    formattedErrors.camion_id = Array.isArray(errors.camion_id)
                        ? errors.camion_id[0]
                        : errors.camion_id;
                }
                if (errors.personnel_id) {
                    formattedErrors.personnel_id = Array.isArray(errors.personnel_id)
                        ? errors.personnel_id[0]
                        : errors.personnel_id;
                }
                if (errors.quantite) {
                    formattedErrors.quantite = Array.isArray(errors.quantite)
                        ? errors.quantite[0]
                        : errors.quantite;
                }
                if (errors.date_consommation) {
                    formattedErrors.date_consommation = Array.isArray(errors.date_consommation)
                        ? errors.date_consommation[0]
                        : errors.date_consommation;
                }

                setLoadErrors(formattedErrors);
            } else {
                alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Fonction pour obtenir la date de début selon la période
    const getStartDateForPeriod = (period) => {
        const now = new Date();
        switch (period) {
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                return startOfWeek;
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(0);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchSearch = searchTerm === '' ||
            t.camion?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.personnel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' ||
            (filterType === 'appro' && t.type === 'approvisionnement') ||
            (filterType === 'conso' && t.type === 'consommation');

        // Filtrer par période
        const matchPeriod = periodFilter === 'all' || (() => {
            const transactionDate = new Date(t.date || t.date_consommation || t.date_approvisionnement);
            const startDate = getStartDateForPeriod(periodFilter);
            return transactionDate >= startDate;
        })();

        return matchSearch && matchType && matchPeriod;
    });

    const approCount = transactions.filter(t => t.type === 'approvisionnement').length;
    const consoCount = transactions.filter(t => t.type === 'consommation').length;

    // Fonction pour filtrer toutes les transactions dans la modal
    const getFilteredAllTransactions = () => {
        let filtered = transactions;

        // Filtrer par recherche
        if (allTransactionsFilter.search) {
            filtered = filtered.filter(t =>
                t.camion?.matricule?.toLowerCase().includes(allTransactionsFilter.search.toLowerCase()) ||
                t.personnel?.name?.toLowerCase().includes(allTransactionsFilter.search.toLowerCase()) ||
                t.notes?.toLowerCase().includes(allTransactionsFilter.search.toLowerCase()) ||
                t.user?.name?.toLowerCase().includes(allTransactionsFilter.search.toLowerCase())
            );
        }

        // Filtrer par type
        if (allTransactionsFilter.type !== 'all') {
            filtered = filtered.filter(t => t.type === allTransactionsFilter.type);
        }

        // Filtrer par période
        if (allTransactionsFilter.period !== 'all') {
            const startDate = getStartDateForPeriod(allTransactionsFilter.period);
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.date || t.date_consommation || t.date_approvisionnement);
                return transactionDate >= startDate;
            });
        }

        return filtered;
    };

    // Fonction pour charger plus de transactions
    const loadMoreTransactions = () => {
        if (allTransactionsLoading || !allTransactionsHasMore) return;

        setAllTransactionsLoading(true);
        setTimeout(() => {
            const filtered = getFilteredAllTransactions();
            const totalLoaded = allTransactionsPage * 20;
            if (totalLoaded >= filtered.length) {
                setAllTransactionsHasMore(false);
            } else {
                setAllTransactionsPage(prev => prev + 1);
            }
            setAllTransactionsLoading(false);
        }, 300);
    };

    // Réinitialiser la pagination quand les filtres changent
    useEffect(() => {
        if (showAllTransactionsModal) {
            const filtered = getFilteredAllTransactions();
            setAllTransactionsHasMore(filtered.length > 20);
            setAllTransactionsPage(1);
        }
    }, [allTransactionsFilter.search, allTransactionsFilter.type, allTransactionsFilter.period, showAllTransactionsModal]);

    if (loading) return <LoadingScreen message="Chargement des données fuel..." />;

    return (
        <>
            <PageContainer
                title="Gestion du Carburant"
                description="Suivi en temps réel du stock et des consommations"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowLoadModal(true)}
                            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent hover:text-foreground transition-all"
                        >
                            <ArrowDownRight className="h-4 w-4" />
                            Charger un camion
                        </button>
                        <button
                            onClick={() => setShowStockModal(true)}
                            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30"
                        >
                            <Plus className="h-4 w-4" />
                            Approvisionnement
                        </button>
                    </div>
                }
            >
                {/* Filtre de période */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-foreground">Période :</label>
                        <Select value={periodFilter} onValueChange={setPeriodFilter}>
                            <SelectTrigger className="w-[180px] h-10">
                                <SelectValue placeholder="Sélectionner une période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois</SelectItem>
                                <SelectItem value="year">Cette année</SelectItem>
                                <SelectItem value="all">Toutes périodes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setShowStockInfoModal(true)}
                        className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                <FuelIcon className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Stock Actuel</p>
                        <p className="text-3xl font-semibold text-foreground">{stock?.quantite_stock || 0}L</p>
                        <p className="text-xs text-muted-foreground mt-2">Autonomie: ~5 jours</p>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        onClick={() => setShowApprovisionnementsModal(true)}
                        className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500/20 transition-colors">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Approvisionnements</p>
                        <p className="text-3xl font-semibold text-foreground">
                            {stock?.total_approvisionnements || 0}L
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {periodFilter === 'week' ? 'Cette semaine' :
                                periodFilter === 'month' ? 'Ce mois-ci' :
                                    periodFilter === 'year' ? 'Cette année' :
                                        'Toutes périodes'}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        onClick={() => setShowConsommationsModal(true)}
                        className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-border/60 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 group-hover:bg-rose-500/20 transition-colors">
                                <ArrowDownRight className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Consommations</p>
                        <p className="text-3xl font-semibold text-foreground">
                            {stock?.total_consommations || 0}L
                        </p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {periodFilter === 'week' ? 'Cette semaine' :
                                periodFilter === 'month' ? 'Ce mois-ci' :
                                    periodFilter === 'year' ? 'Cette année' :
                                        'Toutes périodes'}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500/50 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-4 my-7">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher une transaction..."
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Tabs value={filterType} onValueChange={setFilterType}>
                            <TabsList className="h-auto p-1 bg-muted/30 backdrop-blur-sm border border-border/40 inline-flex w-auto">
                                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                                    Toutes
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-xs font-semibold",
                                        filterType === 'all' ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {transactions.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="appro" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                                    Appros
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-xs font-semibold",
                                        filterType === 'appro' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {approCount}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="conso" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                                    Consos
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-xs font-semibold",
                                        filterType === 'conso' ? "bg-rose-500/10 text-rose-600" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {consoCount}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Transactions List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-border/40">
                        <h3 className="text-lg font-semibold text-foreground">Historique des transactions</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} récente{filteredTransactions.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="divide-y divide-border/40">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-16 text-center">
                                <FuelIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-sm text-muted-foreground">Aucune transaction trouvée</p>
                            </div>
                        ) : (
                            <>
                                {filteredTransactions.slice(0, 10).map((trans, index) => (
                                    <motion.div
                                        key={trans.uniqueKey || `${trans.type}-${trans.id}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="p-4 hover:bg-accent/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                                trans.type === 'consommation'
                                                    ? "bg-rose-500/10 text-rose-600"
                                                    : "bg-emerald-500/10 text-emerald-600"
                                            )}>
                                                {trans.type === 'consommation' ? (
                                                    <ArrowDownRight className="h-5 w-5" />
                                                ) : (
                                                    <ArrowUpRight className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {trans.camion ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                                            <p className="text-sm font-medium text-foreground">
                                                                {trans.camion?.matricule || trans.camion?.modele}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-xs text-muted-foreground">
                                                                {trans.personnel?.name}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {trans.notes || 'Approvisionnement stock'}
                                                        </p>
                                                        {trans.user && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <p className="text-xs text-muted-foreground">
                                                                    {trans.user.name}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-lg font-semibold",
                                                    trans.type === 'consommation'
                                                        ? "text-rose-600 dark:text-rose-400"
                                                        : "text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                    {trans.type === 'consommation' ? '-' : '+'}{trans.quantite}L
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(trans.date_consommation || trans.date_approvisionnement).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {filteredTransactions.length > 10 && (
                                    <div className="p-4 text-center border-t border-border/40">
                                        <button
                                            onClick={() => setShowAllTransactionsModal(true)}
                                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Voir toutes les transactions ({filteredTransactions.length})
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </PageContainer>

            {/* Modal Approvisionnement */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Approvisionnement en carburant</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ajoutez du carburant au stock principal
                                </p>
                            </div>
                            <button
                                onClick={() => setShowStockModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleStockSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Quantité (Litres)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className={cn(
                                        "w-full h-10 px-3 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                        stockErrors.quantite
                                            ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                                            : "border-border/40 focus:border-primary/40"
                                    )}
                                    placeholder="Ex: 5000"
                                    value={stockFormData.quantite}
                                    onChange={e => {
                                        setStockFormData({ ...stockFormData, quantite: e.target.value });
                                        if (stockErrors.quantite) {
                                            setStockErrors({ ...stockErrors, quantite: '' });
                                        }
                                    }}
                                />
                                {stockErrors.quantite && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>•</span>
                                        {stockErrors.quantite}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Date d'approvisionnement</Label>
                                <Popover open={calendarOpenStock} onOpenChange={setCalendarOpenStock} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background/50 border-border/40 hover:bg-accent/50",
                                                !stockFormData.date_approvisionnement && "text-muted-foreground",
                                                stockErrors.date_approvisionnement && "border-red-500/50"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {stockFormData.date_approvisionnement ? (
                                                format(new Date(stockFormData.date_approvisionnement), "PPP", { locale: fr })
                                            ) : (
                                                <span>Sélectionner une date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[200]" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={stockFormData.date_approvisionnement ? new Date(stockFormData.date_approvisionnement) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setStockFormData({
                                                        ...stockFormData,
                                                        date_approvisionnement: normalizeDateToString(date)
                                                    });
                                                    setCalendarOpenStock(false);
                                                    if (stockErrors.date_approvisionnement) {
                                                        setStockErrors({ ...stockErrors, date_approvisionnement: '' });
                                                    }
                                                }
                                            }}
                                            disabled={{ after: new Date() }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {stockErrors.date_approvisionnement && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>•</span>
                                        {stockErrors.date_approvisionnement}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Notes (optionnel)</label>
                                <textarea
                                    rows="3"
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none",
                                        stockErrors.notes
                                            ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                                            : "border-border/40 focus:border-primary/40"
                                    )}
                                    placeholder="Ex: Livraison Total Énergies"
                                    value={stockFormData.notes}
                                    onChange={e => {
                                        setStockFormData({ ...stockFormData, notes: e.target.value });
                                        if (stockErrors.notes) {
                                            setStockErrors({ ...stockErrors, notes: '' });
                                        }
                                    }}
                                />
                                {stockErrors.notes && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>•</span>
                                        {stockErrors.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStockModal(false);
                                        setStockErrors({});
                                    }}
                                    className="flex-1 h-10 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Ajouter au stock
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal Consommation */}
            {showLoadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Charger un camion</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ajoutez du carburant dans un camion
                                </p>
                            </div>
                            <button
                                onClick={handleCloseLoadModal}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleLoadSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Camion</label>
                                <Select
                                    value={loadFormData.camion_id}
                                    onValueChange={(value) => {
                                        // Trouver l'affectation active pour ce camion
                                        const activeAssignment = assignments.find(
                                            a => a.camion_id === parseInt(value) && a.is_active
                                        );

                                        setLoadFormData({
                                            ...loadFormData,
                                            camion_id: value,
                                            personnel_id: activeAssignment?.user_id?.toString() || ''
                                        });

                                        if (loadErrors.camion_id) {
                                            setLoadErrors({ ...loadErrors, camion_id: '' });
                                        }
                                        if (loadErrors.personnel_id) {
                                            setLoadErrors({ ...loadErrors, personnel_id: '' });
                                        }
                                    }}
                                >
                                    <SelectTrigger className={cn(
                                        "w-full h-10 rounded-lg bg-background/50",
                                        loadErrors.camion_id
                                            ? "border-red-500/50 focus:border-red-500/50"
                                            : "border-border/40"
                                    )}>
                                        <SelectValue placeholder="Sélectionner un camion" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                        {camions
                                            .filter(c => {
                                                // Filtrer seulement les camions avec une affectation active
                                                return assignments.some(a => a.camion_id === c.id && a.is_active);
                                            })
                                            .map(c => {
                                                const assignment = assignments.find(a => a.camion_id === c.id && a.is_active);
                                                return (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.matricule} - {c.modele} {assignment?.user?.name && `(${assignment.user.name})`}
                                                    </SelectItem>
                                                );
                                            })}
                                        {camions.filter(c => assignments.some(a => a.camion_id === c.id && a.is_active)).length === 0 && (
                                            <SelectItem value="" disabled>Aucun camion avec affectation active</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {loadErrors.camion_id && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>•</span>
                                        {loadErrors.camion_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Conducteur</label>
                                <Select
                                    value={loadFormData.personnel_id}
                                    disabled={true}
                                >
                                    <SelectTrigger className={cn(
                                        "w-full h-10 rounded-lg bg-muted/50 cursor-not-allowed opacity-80",
                                        loadErrors.personnel_id
                                            ? "border-red-500/50"
                                            : "border-border/40"
                                    )}>
                                        <SelectValue placeholder={loadFormData.camion_id ? "Sélectionnez d'abord un camion" : "Sélectionnez d'abord un camion"}>
                                            {loadFormData.personnel_id ? (() => {
                                                const driver = users.find(u => u.id.toString() === loadFormData.personnel_id);
                                                return driver?.name || '';
                                            })() : (loadFormData.camion_id ? "Sélectionnez d'abord un camion" : "Sélectionnez d'abord un camion")}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                        {users.filter(u => u.roles?.some(r => r.name === 'Chauffeur')).map(u => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {loadFormData.personnel_id && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>•</span>
                                        Le conducteur est automatiquement assigné selon l'affectation du camion
                                    </p>
                                )}
                                {loadErrors.personnel_id && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>•</span>
                                        {loadErrors.personnel_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Quantité (Litres)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className={cn(
                                            "w-full h-10 px-3 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                            loadErrors.quantite
                                                ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                                                : "border-border/40 focus:border-primary/40"
                                        )}
                                        placeholder="Ex: 45"
                                        value={loadFormData.quantite}
                                        onChange={e => {
                                            setLoadFormData({ ...loadFormData, quantite: e.target.value });
                                            if (loadErrors.quantite) {
                                                setLoadErrors({ ...loadErrors, quantite: '' });
                                            }
                                        }}
                                    />
                                    {loadErrors.quantite && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <span>•</span>
                                            {loadErrors.quantite}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Date</Label>
                                    <Popover open={calendarOpenLoad} onOpenChange={setCalendarOpenLoad} modal={false}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-background/50 border-border/40 hover:bg-accent/50",
                                                    !loadFormData.date_consommation && "text-muted-foreground",
                                                    loadErrors.date_consommation && "border-red-500/50"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {loadFormData.date_consommation ? (
                                                    format(new Date(loadFormData.date_consommation), "PPP", { locale: fr })
                                                ) : (
                                                    <span>Sélectionner une date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[200]" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={loadFormData.date_consommation ? new Date(loadFormData.date_consommation) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setLoadFormData({
                                                            ...loadFormData,
                                                            date_consommation: normalizeDateToString(date)
                                                        });
                                                        setCalendarOpenLoad(false);
                                                        if (loadErrors.date_consommation) {
                                                            setLoadErrors({ ...loadErrors, date_consommation: '' });
                                                        }
                                                    }
                                                }}
                                                disabled={{ after: new Date() }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {loadErrors.date_consommation && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <span>•</span>
                                            {loadErrors.date_consommation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseLoadModal}
                                    className="flex-1 h-10 rounded-lg border border-border/40 bg-background/50 text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !loadFormData.camion_id || !loadFormData.personnel_id}
                                    className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Charger le camion
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal Toutes les transactions */}
            {showAllTransactionsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Toutes les transactions</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Historique complet avec filtres et chargement au scroll
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAllTransactionsModal(false);
                                    setAllTransactionsPage(1);
                                    setAllTransactionsFilter({ search: '', type: 'all', period: 'all' });
                                }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filtres */}
                        <div className="p-6 border-b border-border/40 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                        value={allTransactionsFilter.search}
                                        onChange={(e) => {
                                            setAllTransactionsFilter({ ...allTransactionsFilter, search: e.target.value });
                                            setAllTransactionsPage(1);
                                        }}
                                    />
                                </div>

                                <Select
                                    value={allTransactionsFilter.type}
                                    onValueChange={(value) => {
                                        setAllTransactionsFilter({ ...allTransactionsFilter, type: value });
                                        setAllTransactionsPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous types</SelectItem>
                                        <SelectItem value="approvisionnement">Approvisionnements</SelectItem>
                                        <SelectItem value="consommation">Consommations</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={allTransactionsFilter.period}
                                    onValueChange={(value) => {
                                        setAllTransactionsFilter({ ...allTransactionsFilter, period: value });
                                        setAllTransactionsPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes périodes</SelectItem>
                                        <SelectItem value="week">Cette semaine</SelectItem>
                                        <SelectItem value="month">Ce mois</SelectItem>
                                        <SelectItem value="year">Cette année</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Liste des transactions avec scroll */}
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar"
                            onScroll={(e) => {
                                const target = e.target;
                                if (
                                    target.scrollHeight - target.scrollTop <= target.clientHeight + 100 &&
                                    !allTransactionsLoading &&
                                    allTransactionsHasMore
                                ) {
                                    loadMoreTransactions();
                                }
                            }}
                        >
                            {getFilteredAllTransactions().slice(0, allTransactionsPage * 20).map((trans, index) => (
                                <motion.div
                                    key={trans.uniqueKey || `${trans.type}-${trans.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="p-4 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                            trans.type === 'consommation'
                                                ? "bg-rose-500/10 text-rose-600"
                                                : "bg-emerald-500/10 text-emerald-600"
                                        )}>
                                            {trans.type === 'consommation' ? (
                                                <ArrowDownRight className="h-5 w-5" />
                                            ) : (
                                                <ArrowUpRight className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {trans.camion ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-sm font-medium text-foreground">
                                                            {trans.camion?.matricule || trans.camion?.modele}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">
                                                            {trans.personnel?.name}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {trans.notes || 'Approvisionnement stock'}
                                                    </p>
                                                    {trans.user && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-xs text-muted-foreground">
                                                                {trans.user.name}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-lg font-semibold",
                                                trans.type === 'consommation'
                                                    ? "text-rose-600 dark:text-rose-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            )}>
                                                {trans.type === 'consommation' ? '-' : '+'}{trans.quantite}L
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(trans.date_consommation || trans.date_approvisionnement).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {allTransactionsLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {!allTransactionsHasMore && getFilteredAllTransactions().length > 20 && (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                    Toutes les transactions ont été chargées
                                </div>
                            )}

                            {getFilteredAllTransactions().length === 0 && (
                                <div className="p-16 text-center">
                                    <FuelIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                    <p className="text-sm text-muted-foreground">Aucune transaction trouvée</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Info Stock Actuel */}
            {showStockInfoModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-2xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Stock Actuel - Comment ça fonctionne</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Comprendre la gestion du stock de carburant
                                </p>
                            </div>
                            <button
                                onClick={() => setShowStockInfoModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <FuelIcon className="h-6 w-6 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-2">Stock Actuel : {stock?.quantite_stock || 0}L</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Le stock actuel représente la quantité totale de carburant disponible dans le dépôt principal.
                                            Cette valeur est mise à jour automatiquement à chaque approvisionnement et consommation.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                            <h4 className="font-semibold text-foreground">Approvisionnements</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Lorsqu'un approvisionnement est ajouté, le stock augmente automatiquement de la quantité ajoutée.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowDownRight className="h-5 w-5 text-rose-600" />
                                            <h4 className="font-semibold text-foreground">Consommations</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Lorsqu'un camion est chargé, le stock diminue automatiquement de la quantité consommée.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                                    <h4 className="font-semibold text-foreground mb-2">Formule de calcul</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-mono text-foreground">Stock Actuel = Stock Initial + Approvisionnements - Consommations</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Le système calcule et met à jour cette valeur en temps réel pour garantir une traçabilité complète.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end p-6 border-t border-border/40">
                            <button
                                onClick={() => setShowStockInfoModal(false)}
                                className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Compris
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Approvisionnements avec calendrier */}
            {showApprovisionnementsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Rapport des Approvisionnements</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Sélectionnez une date pour voir les détails
                                </p>
                            </div>
                            <button
                                onClick={() => setShowApprovisionnementsModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            <EngineScheduleDatePicker
                                label="Sélectionner une date"
                                value={selectedDateAppro}
                                onChange={(date, dateISO) => {
                                    setSelectedDateAppro(date);
                                }}
                                placeholder="Ex: Yesterday, Today, Last Monday..."
                                maxDate={new Date()} // Désactiver les dates futures
                            />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground">Approvisionnements du {selectedDateAppro ? format(selectedDateAppro, "PPP", { locale: fr }) : '...'}</h3>

                                {(() => {
                                    if (!selectedDateAppro) {
                                        return (
                                            <div className="p-8 text-center rounded-lg border border-border/40 bg-muted/20">
                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                                <p className="text-sm text-muted-foreground">Veuillez sélectionner une date</p>
                                            </div>
                                        );
                                    }

                                    // Normaliser la date sélectionnée au format YYYY-MM-DD
                                    const selectedDateStr = normalizeDateToString(selectedDateAppro);

                                    const dateApprovisionnements = allApprovisionnements.filter(a => {
                                        if (!a.date_approvisionnement) return false;
                                        const approDateStr = normalizeDateToString(a.date_approvisionnement);
                                        return approDateStr === selectedDateStr;
                                    });

                                    if (dateApprovisionnements.length === 0) {
                                        return (
                                            <div className="p-8 text-center rounded-lg border border-border/40 bg-muted/20">
                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                                <p className="text-sm text-muted-foreground">Aucun approvisionnement pour cette date</p>
                                            </div>
                                        );
                                    }

                                    const totalQuantite = dateApprovisionnements.reduce((sum, a) => sum + (parseFloat(a.quantite) || 0), 0);
                                    const displayedApprovisionnements = dateApprovisionnements.slice(0, displayedItemsAppro);
                                    const hasMoreAppro = displayedItemsAppro < dateApprovisionnements.length;

                                    return (
                                        <>
                                            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-foreground">Total du jour</span>
                                                    <span className="text-lg font-semibold text-emerald-600">{totalQuantite}L</span>
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {dateApprovisionnements.length} approvisionnement{dateApprovisionnements.length > 1 ? 's' : ''} au total
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {displayedApprovisionnements.map((appro, index) => {
                                                    const user = users.find(u => u.id === appro.user_id);
                                                    return (
                                                        <div key={appro.id || index} className="p-4 rounded-lg border border-border/40 bg-background/50">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                                                                        <h4 className="font-semibold text-foreground">Approvisionnement #{appro.id || index + 1}</h4>
                                                                    </div>
                                                                    <div className="space-y-1 text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                                            <span className="text-muted-foreground">Effectué par :</span>
                                                                            <span className="font-medium text-foreground">{user?.name || 'Utilisateur inconnu'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                            <span className="text-muted-foreground">Date :</span>
                                                                            <span className="font-medium text-foreground">
                                                                                {new Date(appro.date_approvisionnement).toLocaleDateString('fr-FR', {
                                                                                    day: 'numeric',
                                                                                    month: 'long',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                        {appro.notes && (
                                                                            <div className="flex items-start gap-2 mt-2">
                                                                                <span className="text-muted-foreground">Notes :</span>
                                                                                <span className="text-foreground">{appro.notes}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-2xl font-bold text-emerald-600">+{appro.quantite}L</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {hasMoreAppro && (
                                                    <div
                                                        ref={approScrollRef}
                                                        className="flex items-center justify-center py-4"
                                                    >
                                                        <button
                                                            onClick={() => setDisplayedItemsAppro(prev => Math.min(prev + 10, dateApprovisionnements.length))}
                                                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                                                        >
                                                            Charger plus ({dateApprovisionnements.length - displayedItemsAppro} restant{dateApprovisionnements.length - displayedItemsAppro > 1 ? 's' : ''})
                                                            <Loader2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                {!hasMoreAppro && dateApprovisionnements.length > 10 && (
                                                    <div className="text-center py-2 text-xs text-muted-foreground">
                                                        Tous les approvisionnements sont affichés
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex items-center justify-end p-6 border-t border-border/40">
                            <button
                                onClick={() => setShowApprovisionnementsModal(false)}
                                className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div >
                </div >
            )}

            {/* Modal Consommations avec calendrier */}
            {showConsommationsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border/40 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Rapport des Consommations</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Sélectionnez une date pour voir les détails
                                </p>
                            </div>
                            <button
                                onClick={() => setShowConsommationsModal(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            <EngineScheduleDatePicker
                                label="Sélectionner une date"
                                value={selectedDateConso}
                                onChange={(date, dateISO) => {
                                    setSelectedDateConso(date);
                                }}
                                placeholder="Ex: Yesterday, Today, Last Monday..."
                                maxDate={new Date()} // Désactiver les dates futures
                            />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground">Consommations du {selectedDateConso ? format(selectedDateConso, "PPP", { locale: fr }) : '...'}</h3>

                                {(() => {
                                    if (!selectedDateConso) {
                                        return (
                                            <div className="p-8 text-center rounded-lg border border-border/40 bg-muted/20">
                                                <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                                <p className="text-sm text-muted-foreground">Veuillez sélectionner une date</p>
                                            </div>
                                        );
                                    }

                                    // Normaliser la date sélectionnée au format YYYY-MM-DD
                                    const selectedDateStr = normalizeDateToString(selectedDateConso);

                                    const dateConsommations = allConsommations.filter(c => {
                                        if (!c.date_consommation) return false;
                                        const consoDateStr = normalizeDateToString(c.date_consommation);
                                        return consoDateStr === selectedDateStr;
                                    });

                                    if (dateConsommations.length === 0) {
                                        return (
                                            <div className="p-8 text-center rounded-lg border border-border/40 bg-muted/20">
                                                <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                                <p className="text-sm text-muted-foreground">Aucune consommation pour cette date</p>
                                            </div>
                                        );
                                    }

                                    const totalQuantite = dateConsommations.reduce((sum, c) => sum + (parseFloat(c.quantite) || 0), 0);
                                    const displayedConsommations = dateConsommations.slice(0, displayedItemsConso);
                                    const hasMoreConso = displayedItemsConso < dateConsommations.length;

                                    return (
                                        <>
                                            <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-foreground">Total du jour</span>
                                                    <span className="text-lg font-semibold text-rose-600">{totalQuantite}L</span>
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {dateConsommations.length} consommation{dateConsommations.length > 1 ? 's' : ''} au total
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {displayedConsommations.map((conso, index) => {
                                                    const camion = camions.find(c => c.id === conso.camion_id);
                                                    const personnel = users.find(u => u.id === conso.personnel_id);
                                                    return (
                                                        <div key={conso.id || index} className="p-4 rounded-lg border border-border/40 bg-background/50">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <ArrowDownRight className="h-5 w-5 text-rose-600" />
                                                                        <h4 className="font-semibold text-foreground">Consommation #{conso.id || index + 1}</h4>
                                                                    </div>
                                                                    <div className="space-y-1 text-sm">
                                                                        {camion && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                                                <span className="text-muted-foreground">Camion :</span>
                                                                                <span className="font-medium text-foreground">{camion.matricule} - {camion.modele}</span>
                                                                            </div>
                                                                        )}
                                                                        {personnel && (
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                                <span className="text-muted-foreground">Conducteur :</span>
                                                                                <span className="font-medium text-foreground">{personnel.name}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                            <span className="text-muted-foreground">Date :</span>
                                                                            <span className="font-medium text-foreground">
                                                                                {new Date(conso.date_consommation).toLocaleDateString('fr-FR', {
                                                                                    day: 'numeric',
                                                                                    month: 'long',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-2xl font-bold text-rose-600">-{conso.quantite}L</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {hasMoreConso && (
                                                    <div
                                                        ref={consoScrollRef}
                                                        className="flex items-center justify-center py-4"
                                                    >
                                                        <button
                                                            onClick={() => setDisplayedItemsConso(prev => Math.min(prev + 10, dateConsommations.length))}
                                                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                                                        >
                                                            Charger plus ({dateConsommations.length - displayedItemsConso} restant{dateConsommations.length - displayedItemsConso > 1 ? 's' : ''})
                                                            <Loader2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                {!hasMoreConso && dateConsommations.length > 10 && (
                                                    <div className="text-center py-2 text-xs text-muted-foreground">
                                                        Toutes les consommations sont affichées
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex items-center justify-end p-6 border-t border-border/40">
                            <button
                                onClick={() => setShowConsommationsModal(false)}
                                className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div >
                </div >
            )
            }
        </>
    );
};

export default Fuel;
