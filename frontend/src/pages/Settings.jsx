import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Building2, Bell, Shield, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import authService from '../services/authService';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Settings = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.roles?.some(r => r === 'Admin' || r === 'Sous-admin');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState({
        site_name: 'Opsyra',
        site_email: '',
        site_phone: '',
        site_address: '',
        maintenance_mode: false,
        allow_registration: false,
        default_role: 'Chauffeur',
        session_timeout: 30,
        max_login_attempts: 5,
    });

    useEffect(() => {
        // Vérifier les permissions
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchSettings();
    }, [isAdmin, navigate]);

    const fetchSettings = async () => {
        try {
            // Pour l'instant, on utilise des valeurs par défaut
            // Vous pouvez créer un endpoint API pour récupérer les paramètres
            // const response = await api.get('/settings');
            // setSettings(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Erreur récupération paramètres", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        try {
            // Pour l'instant, on simule la sauvegarde
            // Vous pouvez créer un endpoint API pour sauvegarder les paramètres
            // await api.put('/settings', settings);

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAdmin) {
        return null;
    }

    if (loading) return <LoadingScreen message="Chargement des paramètres..." />;

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <PageContainer
            title="Paramètres"
            description="Configurez les paramètres généraux de l'application"
        >
            <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
                {/* Navigation latérale - Linear.app inspired */}
                <nav className="h-fit sticky top-42 hidden lg:block">
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => handleScroll('section-generales')}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                        >
                            Informations générales
                        </button>
                        <button
                            type="button"
                            onClick={() => handleScroll('section-securite')}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                        >
                            Sécurité
                        </button>
                        <button
                            type="button"
                            onClick={() => handleScroll('section-notifications')}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                        >
                            Notifications
                        </button>
                    </div>
                </nav>

                <div className="space-y-6">
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Paramètres enregistrés avec succès</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informations générales - Linear.app inspired */}
                        <Card id="section-generales" className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Informations générales</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Paramètres de base de l'application</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name">Nom du site</Label>
                                    <Input
                                        id="site_name"
                                        value={settings.site_name}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                        placeholder="Opsyra"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_email">Email du site</Label>
                                    <Input
                                        id="site_email"
                                        type="email"
                                        value={settings.site_email}
                                        onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                                        placeholder="contact@opsyra.com"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_phone">Téléphone</Label>
                                    <Input
                                        id="site_phone"
                                        type="tel"
                                        value={settings.site_phone}
                                        onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                                        placeholder="+243 XXX XXX XXX"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_address">Adresse</Label>
                                    <Input
                                        id="site_address"
                                        value={settings.site_address}
                                        onChange={(e) => setSettings({ ...settings, site_address: e.target.value })}
                                        placeholder="Adresse complète"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Sécurité - Linear.app inspired */}
                        <Card id="section-securite" className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Sécurité</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Paramètres de sécurité et authentification</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="maintenance_mode">Mode maintenance</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Désactive l'accès pour tous les utilisateurs sauf les admins
                                        </p>
                                    </div>
                                    <Switch
                                        id="maintenance_mode"
                                        checked={settings.maintenance_mode}
                                        onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow_registration">Autoriser l'inscription</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permet aux nouveaux utilisateurs de s'inscrire
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow_registration"
                                        checked={settings.allow_registration}
                                        onCheckedChange={(checked) => setSettings({ ...settings, allow_registration: checked })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="session_timeout">Délai d'expiration de session (minutes)</Label>
                                        <Input
                                            id="session_timeout"
                                            type="number"
                                            min="5"
                                            max="1440"
                                            value={settings.session_timeout}
                                            onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) || 30 })}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_login_attempts">Tentatives de connexion max</Label>
                                        <Input
                                            id="max_login_attempts"
                                            type="number"
                                            min="3"
                                            max="10"
                                            value={settings.max_login_attempts}
                                            onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) || 5 })}
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="default_role">Rôle par défaut</Label>
                                    <Select
                                        value={settings.default_role}
                                        onValueChange={(value) => setSettings({ ...settings, default_role: value })}
                                        className="h-11"
                                    >
                                        <SelectTrigger id="default_role" className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Chauffeur">Chauffeur</SelectItem>
                                            <SelectItem value="Gestionnaire fuel">Gestionnaire Fuel</SelectItem>
                                            <SelectItem value="Sous-admin">Sous-administrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        {/* Notifications - Linear.app inspired */}
                        {/* <Card id="section-notifications" className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Paramètres de notification</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Les paramètres de notification seront disponibles prochainement</span>
                                    </div>
                                </div>
                            </div>
                        </Card> */}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/30">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    fetchSettings();
                                    setSuccess(false);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Enregistrer les paramètres
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageContainer>
    );
};

export default Settings;

