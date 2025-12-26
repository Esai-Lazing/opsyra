import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Mail, Lock, AlertCircle, ChevronLeft } from 'lucide-react';
import authService from '../services/authService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';
import { AppLogo } from '@/components/AppLogo';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const Login = () => {
    useDocumentTitle('Connexion');
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '', global: '' });
    const navigate = useNavigate();

    // Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateStep1 = () => {
        if (!email) {
            setErrors(prev => ({ ...prev, email: "L'adresse email est requise" }));
            return false;
        }
        if (!emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: "Format d'email invalide" }));
            return false;
        }
        setErrors(prev => ({ ...prev, email: '' }));
        return true;
    };

    const validateStep2 = () => {
        if (!password) {
            setErrors(prev => ({ ...prev, password: "Le mot de passe est requis" }));
            return false;
        }
        setErrors(prev => ({ ...prev, password: '' }));
        return true;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setStep(1);
        setErrors(prev => ({ ...prev, password: '', global: '' }));
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        setErrors(prev => ({ ...prev, global: '' }));

        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error", err);
            setErrors(prev => ({ ...prev, global: "Identifiants incorrects. Veuillez réessayer." }));
            // Optionnel: Revenir à l'étape 1 si l'erreur vient de l'email, mais ici on reste souvent sur le pwd
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative selection:bg-primary/20">

            <div className="w-full max-w-[350px] perspective-[1000px]">
                {/* Logo / Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <AppLogo size={64} />
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bienvenue sur Opsyra</h1>
                    <p className="text-sm text-muted-foreground mt-2">Gérez votre flotte en toute simplicité</p>
                </motion.div>

                {/* Card Wizard */}
                <Card className="relative border-none shadow-none bg-transparent border-0">
                    <div className="py-4 relative">
                        <form onSubmit={handleNext}>
                            <AnimatePresence mode="wait" initial={false}>
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="relative group">
                                                {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" /> */}
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Saisissez votre adresse email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value);
                                                        if (errors.email) setErrors({ ...errors, email: '' });
                                                    }}
                                                    className={cn(
                                                        "h-11 bg-background/50 border-input/60 transition-all",
                                                        errors.email && "border-destructive focus-visible:ring-destructive/30"
                                                    )}
                                                    autoFocus
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-[12px] font-medium text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <Button variant="secondary" className="w-full h-11 text-sm font-medium group" type="submit">
                                            Continuer
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 text-white" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-secondary/50 px-2 h-11 rounded-md border border-border/50">
                                            <span className="truncate flex-1 font-medium text-foreground pl-1">{email}</span>
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 hover:bg-background rounded transition-colors"
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                        <div className="space-y-2">

                                            <div className="relative group">
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Votre mot de passe"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        if (errors.password) setErrors({ ...errors, password: '' });
                                                        if (errors.global) setErrors({ ...errors, global: '' });
                                                    }}
                                                    className={cn(
                                                        "h-11 bg-background/50 border-input/60 transition-all",
                                                        (errors.password || errors.global) && "border-destructive focus-visible:ring-destructive/30"
                                                    )}
                                                    autoFocus
                                                />
                                            </div>
                                            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Mot de passe oublié ?</a>
                                            {errors.password && (
                                                <p className="text-[12px] font-medium text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {errors.global && (
                                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                {errors.global}
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-11 px-3 text-muted-foreground hover:text-foreground border-input/60 bg-background/20"
                                                onClick={handleBack}
                                            >
                                                <ChevronLeft className="h-4 w-4 " />
                                            </Button>
                                            <Button
                                                className="flex-1 h-11 text-sm text-white font-medium"
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Se connecter"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                        {/* Footer progress bar or dots (Optional aesthetic touch) */}
                        <div className="mt-4">
                            <div className="h-1 rounded-full bg-secondary w-full absolute bottom-0 left-0">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    initial={{ width: "50%" }}
                                    animate={{ width: step === 1 ? "50%" : "100%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>

                </Card>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Opsyra. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

