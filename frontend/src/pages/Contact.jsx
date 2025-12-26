import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
    ArrowRight,
    CheckCircle2,
    Headphones,
    Globe,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { publicApi } from '@/api/axios';

const Contact = () => {
    useDocumentTitle('Contact');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Envoyer sans token d'authentification car c'est une route publique
            const response = await publicApi.post('/contact', formData);

            if (response.status === 200) {
                setSubmitted(true);
                setFormData({ name: '', email: '', company: '', message: '' });
                setTimeout(() => {
                    setSubmitted(false);
                }, 5000);
            }
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message:', err);
            setError(
                err.response?.data?.message ||
                'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased">
            <PublicNavbar />

            <main className="relative">
                {/* Hero Section */}
                <section className="py-42 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <p className="text-sm text-white/40 uppercase tracking-widest">Contact</p>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                                Parlons de votre projet
                            </h1>
                            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                                Une question ou besoin d'assistance ? Notre équipe est là pour vous
                                aider à optimiser votre gestion de flotte.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-px bg-white/5" />
                        <div className="grid lg:grid-cols-2">
                            {/* Contact Info */}
                            <div className="p-8 md:p-16 lg:border-r border-white/5">
                                <p className="text-sm text-white/40 mb-4">Informations</p>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                                    Prenez contact avec nous
                                </h2>
                                <p className="text-white/50 mb-10 leading-relaxed">
                                    Notre équipe est disponible pour répondre à toutes vos questions
                                    et vous accompagner dans votre démarche.
                                </p>

                                <div className="space-y-4 mb-8">
                                    {[
                                        { icon: Mail, title: "Email", value: "contact@opsyra.com", link: "mailto:contact@opsyra.com" },
                                        { icon: Phone, title: "Téléphone", value: "+243 990 000 000", link: "tel:+243990000000" },
                                        { icon: MapPin, title: "Adresse", value: "Lubumbashi, République démocratique du Congo" }
                                    ].map((item, i) => (
                                        <motion.a
                                            key={i}
                                            href={item.link || "#"}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 hover:border-white/10 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-sm text-white/40">{item.title}</p>
                                                <p className="font-medium text-sm">{item.value}</p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>


                            </div>

                            {/* Contact Form */}
                            <div className="p-4 md:p-16 bg-[#0a0b0c]/50">
                                <div className="rounded-lg border border-white/10">
                                    {submitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                                            <p className="text-white/50">
                                                Nous vous répondrons dans les plus brefs délais.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit}>
                                            <div className='p-6'>
                                                <h5 className="text-md font-bold">Dites-nous comment nous pouvons vous aider</h5>
                                            </div>
                                            <div className="h-px bg-white/10"></div>
                                            <div className='p-6 space-y-4'>
                                                <div>
                                                    <Label htmlFor="name" className="text-white/60 mb-2 block text-sm">
                                                        Nom complet
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-white/5 border-white/10 focus:border-white/20 h-10"
                                                        placeholder="John Doe"
                                                        required
                                                    />

                                                </div>
                                                <div>
                                                    <Label htmlFor="email" className="text-white/60 mb-2 block text-sm">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="bg-white/5 border-white/10 focus:border-white/20 h-10"
                                                        placeholder="vous@exemple.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="company" className="text-white/60 mb-2 block text-sm">
                                                        Nom de l'entreprise
                                                    </Label>
                                                    <Input
                                                        id="company"
                                                        type="text"
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        className="bg-white/5 border-white/10 focus:border-white/20 h-10"
                                                        placeholder="Nom de l'entreprise (optionnel)"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="message" className="text-white/60 mb-2 block text-sm">
                                                        Message
                                                    </Label>
                                                    <textarea
                                                        id="message"
                                                        rows={5}
                                                        value={formData.message}
                                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/20 focus:ring-0 outline-none transition-colors resize-none text-white placeholder:text-white/30"
                                                        placeholder="Décrivez votre projet..."
                                                        required
                                                    />
                                                </div>
                                                {error && (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                        <span>{error}</span>
                                                    </div>
                                                )}
                                                <div className='flex items-center gap-4 justify-between'>
                                                    <p className="text-white/60 text-sm">Vous pouvez également nous envoyer un e-mail à <a href="mailto:contact@opsyra.com" className="text-white hover:underline">contact@opsyra.com</a></p>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        className="bg-white hover:bg-white/80 font-bold text-black text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Envoi en cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Envoyer le message
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-white/5" />
                </section>

                {/* Support Section */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12">
                            <p className="text-sm text-white/40 mb-4">Support</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Besoin d'aide ?
                            </h2>
                            <p className="text-white/50 max-w-xl">
                                Plusieurs façons de nous contacter selon vos besoins
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden">
                            {[
                                { icon: MessageSquare, title: "Chat en direct", desc: "Discutez avec notre équipe en temps réel", action: "Ouvrir le chat", color: "blue" },
                                { icon: Headphones, title: "Support téléphonique", desc: "Appelez-nous pour une assistance immédiate", action: "Appeler maintenant", color: "green" },
                                { icon: Globe, title: "Centre d'aide", desc: "Consultez notre documentation complète", action: "Voir la documentation", color: "purple" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#0a0b0c] p-8 group"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                                        item.color === "blue" && "bg-blue-500/10",
                                        item.color === "green" && "bg-green-500/10",
                                        item.color === "purple" && "bg-purple-500/10"
                                    )}>
                                        <item.icon className={cn(
                                            "w-6 h-6",
                                            item.color === "blue" && "text-blue-400",
                                            item.color === "green" && "text-green-400",
                                            item.color === "purple" && "text-purple-400"
                                        )} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-white/40 mb-5 leading-relaxed">{item.desc}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/60 hover:text-white hover:bg-white/5 px-0"
                                    >
                                        {item.action}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative">
                    <div className="h-px bg-white/5" />
                    <div className="py-20 px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-[#111213] to-[#0a0b0c] rounded-2xl border border-white/10 p-12 md:p-16 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                    Prêt à démarrer ?
                                </h2>
                                <p className="text-white/50 mb-8 max-w-lg mx-auto">
                                    Rejoignez des centaines d'entreprises qui font confiance à Opsyra.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12">
                                        <Link to="/login">
                                            Commencer maintenant
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/5 rounded-full px-8 h-12 border border-white/10">
                                        <Link to="/about">En savoir plus</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default Contact;
