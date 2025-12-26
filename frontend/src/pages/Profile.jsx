import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2, Shield, CheckCircle, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import authService from '../services/authService';
import { cn } from '../utils/cn';
import LoadingScreen from '../components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { EngineScheduleDatePicker } from '@/components/EngineScheduleDatePicker';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telephone: '',
        adresse: '',
        date_embauche: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/me');
            const userData = response.data;
            setUser(userData);
            setPhotoPreview(userData.photo_profil || null);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                telephone: userData.telephone || '',
                adresse: userData.adresse || '',
                date_embauche: userData.date_embauche || '',
            });
        } catch (error) {
            console.error("Erreur récupération profil", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        try {
            // Préparer les données pour l'envoi
            const dataToSend = {
                ...formData,
                // S'assurer que date_embauche est au bon format ou null
                date_embauche: formData.date_embauche || null,
            };

            const response = await api.put('/profile', dataToSend);
            setSuccess(true);
            // Mettre à jour les données utilisateur dans le localStorage
            const updatedUser = { ...user, ...response.data };
            authService.setCurrentUser(updatedUser);
            setUser(response.data);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Erreur mise à jour profil:", error);
            const errorMessage = error.response?.data?.message
                || error.response?.data?.errors
                || "Erreur lors de la mise à jour";
            alert(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setSubmitting(false);
        }
    };

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide.');
            return;
        }

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop lourde (max 5 Mo).');
            return;
        }

        // Afficher la preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Uploader la photo
        setUploadingPhoto(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('photo', file);

            const response = await api.post('/profile/photo', uploadFormData, {
                timeout: 30000,
            });

            // Mettre à jour l'utilisateur avec la nouvelle photo
            setUser({ ...user, photo_profil: response.data.photo_profil });
            const updatedUser = { ...user, photo_profil: response.data.photo_profil };
            authService.setCurrentUser(updatedUser);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            let errorMessage = "Erreur lors de l'upload de la photo";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join(', ');
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
            // Réinitialiser la preview en cas d'erreur
            setPhotoPreview(user?.photo_profil || null);
        } finally {
            setUploadingPhoto(false);
            // Réinitialiser l'input
            e.target.value = '';
        }
    };

    const handleRemovePhoto = async () => {
        if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
            return;
        }

        try {
            // Envoyer une requête pour supprimer la photo
            // Pour l'instant, on peut simplement mettre à jour l'utilisateur
            // ou créer un endpoint dédié pour la suppression
            setPhotoPreview(null);
            setUser({ ...user, photo_profil: null });
        } catch (error) {
            console.error("Erreur suppression photo:", error);
            alert("Erreur lors de la suppression de la photo");
        }
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            'Admin': 'Administrateur',
            'Sous-admin': 'Sous-administrateur',
            'Chauffeur': 'Chauffeur',
            'Gestionnaire fuel': 'Gestionnaire Fuel'
        };
        return roleMap[role] || role;
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'Admin' || role === 'Sous-admin') {
            return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
        }
        if (role === 'Gestionnaire fuel') {
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    };

    if (loading) return <LoadingScreen message="Chargement du profil..." />;

    return (
        <PageContainer
            title="Mon profil"
            description="Gérez vos informations personnelles et préférences"
        >
            <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
                {/* Navigation latérale - Linear.app inspired */}
                <nav className="h-fit sticky top-42 hidden lg:block">
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => handleScroll('section-profil')}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground text-foreground bg-muted/50 transition-all duration-200"
                        >
                            Gestion du profil
                        </button>
                    </div>
                </nav>

                <div className="space-y-6">
                    {/* Profile Header - Linear.app inspired */}
                    <Card id="section-profil" className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-2xl text-primary border-2 border-primary/20 overflow-hidden">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt={user?.name || 'Profil'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    id="photo-upload"
                                    disabled={uploadingPhoto}
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                                >
                                    {uploadingPhoto ? (
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="h-6 w-6 text-white" />
                                    )}
                                </label>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm"
                                        title="Supprimer la photo"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-foreground">{user?.name || 'Utilisateur'}</h2>
                                <p className="text-sm text-muted-foreground mt-1">{user?.email || ''}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    {user?.roles?.map((role, index) => (
                                        <span
                                            key={index}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border",
                                                getRoleBadgeColor(role)
                                            )}
                                        >
                                            <Shield className="h-3 w-3" />
                                            {getRoleDisplayName(role)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Profile Form - Linear.app inspired */}
                    <Card id="section-infos" className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Nom complet
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telephone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Téléphone
                                    </Label>
                                    <Input
                                        id="telephone"
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        placeholder="+243 XXX XXX XXX"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_embauche" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Date d'embauche
                                    </Label>
                                    <EngineScheduleDatePicker
                                        value={formData.date_embauche ? new Date(formData.date_embauche) : null}
                                        onChange={(date) => {
                                            // Formater la date au format YYYY-MM-DD pour Laravel
                                            const formattedDate = date ? date.toISOString().split('T')[0] : '';
                                            setFormData({
                                                ...formData,
                                                date_embauche: formattedDate,
                                            });
                                        }}
                                        placeholder="Sélectionner une date"
                                        className="w-full h-11"
                                    />
                                </div>
                            </div>

                            <div id="section-contact" className="space-y-2">
                                <Label htmlFor="adresse" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Adresse
                                </Label>
                                <Input
                                    id="adresse"
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    placeholder="Votre adresse complète"
                                    className="h-11"
                                />
                            </div>

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Profil mis à jour avec succès</span>
                                </motion.div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/30">
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
                                            Enregistrer les modifications
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default Profile;

