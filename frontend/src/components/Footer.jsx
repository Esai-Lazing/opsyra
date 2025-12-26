import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import VariableProximity from '@/components/VariableProximity';
import { publicApi } from '@/api/axios';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const Footer = () => {
    const containerRef = useRef(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const response = await publicApi.post('/newsletter/subscribe', { email });

            setStatus('success');
            setMessage(response.data.message || 'Inscription réussie !');
            setEmail('');

            // Réinitialiser le message après 5 secondes
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        } catch (err) {
            setStatus('error');
            setMessage(
                err.response?.data?.message ||
                'Une erreur est survenue lors de votre inscription. Veuillez réessayer.'
            );

            // Réinitialiser le message après 5 secondes
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        } finally {
            setLoading(false);
        }
    };
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#08090a]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 md:gap-8">
                    <div className="col-span-2 lg:col-span-1 space-y-6">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                            <AppLogo size={28} showText={false} />
                            <span>Opsyra</span>
                        </Link>
                        <p className="text-sm text-linear-muted">
                            La plateforme d'ingénierie logicielle pour la gestion de flotte moderne.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4 text-white uppercase tracking-widest text-[10px]">Produit</p>
                        <ul className="space-y-3 text-sm text-linear-muted">
                            <li><Link to="/about" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4 text-white uppercase tracking-widest text-[10px]">Ressources</p>
                        <ul className="space-y-3 text-sm text-linear-muted">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4 text-white uppercase tracking-widest text-[10px]">Légal</p>
                        <ul className="space-y-3 text-sm text-linear-muted">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Mentions légales</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Confidentialité</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">CGU</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <p className="text-sm font-semibold mb-4 text-white uppercase tracking-widest text-[10px]">Newsletters</p>
                        <p className="text-xs text-linear-muted mb-4">Inscrivez-vous pour les dernières mises à jour.</p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/20 transition-colors w-full text-white placeholder:text-linear-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={loading || !email}
                                    className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        'OK'
                                    )}
                                </Button>
                            </div>
                            {status !== 'idle' && message && (
                                <div className={`flex items-center gap-2 text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {status === 'success' ? (
                                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                    )}
                                    <span>{message}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Large Opsyra text with Variable Font Cursor Proximity */}
                <div ref={containerRef} className="mt-16 pt-16 w-full flex items-center justify-center">
                    <VariableProximity
                        label="Opsyra"
                        className="text-white font-bold cursor-default"
                        style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}
                        fromFontVariationSettings="'wght' 400"
                        toFontVariationSettings="'wght' 900"
                        containerRef={containerRef}
                        radius={250}
                        falloff="linear"
                    />
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-linear-muted">
                        © 2025 Opsyra Inc. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-linear-muted">
                        <Link to="/contact" className="hover:text-white transition-colors">Conditions</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Confidentialité</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>


            </div>
        </footer>
    );
};

