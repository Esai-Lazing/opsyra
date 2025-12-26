import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, User, Truck, Settings, AlertTriangle, Fuel, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import api from '@/api/axios';
import authService from '@/services/authService';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 10;

export const SearchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const user = authService.getCurrentUser();
    const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Sous-admin');

    // Charger l'historique au montage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Erreur lors du chargement de l\'historique', e);
            }
        }
    }, []);

    // Focus sur l'input quand la modale s'ouvre
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setSelectedIndex(-1);
        }
    }, [isOpen]);

    // Recherche avec debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const [usersRes, enginsRes, camionsRes, incidentsRes] = await Promise.allSettled([
                isAdmin ? api.get('/users') : Promise.resolve({ value: { data: [] } }),
                isAdmin ? api.get('/engins') : Promise.resolve({ value: { data: [] } }),
                isAdmin ? api.get('/camions') : Promise.resolve({ value: { data: [] } }),
                api.get('/incidents'),
            ]);

            const allResults = [];

            // Utilisateurs
            if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
                usersRes.value.data
                    .filter(u =>
                        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .forEach(user => {
                        allResults.push({
                            id: user.id,
                            type: 'user',
                            title: user.name,
                            subtitle: user.email,
                            icon: User,
                            route: '/dashboard/personnel',
                            color: 'text-blue-500',
                        });
                    });
            }

            // Engins
            if (enginsRes.status === 'fulfilled' && enginsRes.value?.data) {
                enginsRes.value.data
                    .filter(e =>
                        e.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.type?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .forEach(engin => {
                        allResults.push({
                            id: engin.id,
                            type: 'engin',
                            title: engin.nom || engin.matricule,
                            subtitle: `${engin.type} • ${engin.matricule}`,
                            icon: Settings,
                            route: '/dashboard/engins',
                            color: 'text-purple-500',
                        });
                    });
            }

            // Camions
            if (camionsRes.status === 'fulfilled' && camionsRes.value?.data) {
                camionsRes.value.data
                    .filter(c =>
                        c.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.modele?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .forEach(camion => {
                        allResults.push({
                            id: camion.id,
                            type: 'camion',
                            title: camion.matricule,
                            subtitle: `${camion.modele} • ${camion.capacite}L`,
                            icon: Truck,
                            route: '/dashboard/camions',
                            color: 'text-emerald-500',
                        });
                    });
            }

            // Incidents
            if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.data) {
                incidentsRes.value.data
                    .filter(i =>
                        i.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .forEach(incident => {
                        allResults.push({
                            id: incident.id,
                            type: 'incident',
                            title: incident.titre,
                            subtitle: `Gravité: ${incident.gravite} • Statut: ${incident.statut}`,
                            icon: AlertTriangle,
                            route: '/dashboard/incidents',
                            color: 'text-destructive',
                        });
                    });
            }

            // Filtrer par catégorie active
            const filtered = activeCategory === 'all'
                ? allResults
                : allResults.filter(r => r.type === activeCategory);

            setResults(filtered.slice(0, 8)); // Limiter à 8 résultats
        } catch (error) {
            console.error('Erreur lors de la recherche', error);
        } finally {
            setLoading(false);
        }
    };

    const addToHistory = (item) => {
        const newHistory = [
            item,
            ...history.filter(h => h.query !== item.query)
        ].slice(0, MAX_HISTORY);
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    const handleSelect = (result) => {
        addToHistory({ query, type: result.type, title: result.title });
        navigate(result.route);
        onClose();
    };

    const handleHistorySelect = (historyItem) => {
        setQuery(historyItem.query);
        performSearch(historyItem.query);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < (query ? results.length : history.length) - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            if (query) {
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else {
                if (history[selectedIndex]) {
                    handleHistorySelect(history[selectedIndex]);
                }
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const categories = [
        { id: 'all', label: 'Tout', count: results.length },
        { id: 'user', label: 'Utilisateurs', count: results.filter(r => r.type === 'user').length },
        { id: 'engin', label: 'Engins', count: results.filter(r => r.type === 'engin').length },
        { id: 'camion', label: 'Camions', count: results.filter(r => r.type === 'camion').length },
        { id: 'incident', label: 'Incidents', count: results.filter(r => r.type === 'incident').length },
    ];

    const displayResults = query ? results : [];
    const showHistory = !query && history.length > 0;

    if (typeof window === 'undefined') return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <div
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-lg bg-popover border border-border rounded-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 p-4 border-b border-border">
                                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Rechercher des utilisateurs, engins, camions, incidents..."
                                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                                />
                                <div className="flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="h-6 w-6 rounded-sm flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    <kbd className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded border border-border">
                                        <Command className="h-3 w-3" />K
                                    </kbd>
                                </div>
                            </div>

                            {/* Categories */}
                            {query && (
                                <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                                                activeCategory === cat.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {cat.label}
                                            {cat.count > 0 && (
                                                <span className="ml-1.5 opacity-70">({cat.count})</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Results */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <p className="mt-2 text-sm text-muted-foreground">Recherche en cours...</p>
                                    </div>
                                ) : query ? (
                                    displayResults.length > 0 ? (
                                        <div className="p-2">
                                            {displayResults.map((result, index) => {
                                                const Icon = result.icon;
                                                return (
                                                    <button
                                                        key={`${result.type}-${result.id}`}
                                                        onClick={() => handleSelect(result)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                                                            selectedIndex === index
                                                                ? "bg-accent"
                                                                : "hover:bg-accent/50"
                                                        )}
                                                    >
                                                        <div className={cn("h-9 w-9 rounded-md flex items-center justify-center bg-muted/50", result.color)}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {result.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {result.subtitle}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Essayez avec d'autres mots-clés
                                            </p>
                                        </div>
                                    )
                                ) : showHistory ? (
                                    <div className="p-2">
                                        <div className="flex items-center justify-between px-3 py-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Recherches récentes
                                                </span>
                                            </div>
                                            <button
                                                onClick={clearHistory}
                                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Effacer
                                            </button>
                                        </div>
                                        {history.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleHistorySelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                                                    selectedIndex === index
                                                        ? "bg-accent"
                                                        : "hover:bg-accent/50"
                                                )}
                                            >
                                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {item.query}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            Commencez à taper pour rechercher
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Utilisez <kbd className="px-1.5 py-0.5 text-xs font-medium bg-muted rounded border border-border">⌘K</kbd> pour ouvrir rapidement
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

