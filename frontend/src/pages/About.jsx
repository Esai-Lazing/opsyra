import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import {
    Target,
    Users,
    Shield,
    Rocket,
    Award,
    TrendingUp,
    Zap,
    Globe,
    CheckCircle2,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const About = () => {
    useDocumentTitle('À propos');
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
                            <p className="text-sm text-white/40 uppercase tracking-widest">À propos</p>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-2xl mx-auto font-bold tracking-tight leading-[1.05]">
                                Construire l'avenir de la gestion de flotte
                            </h1>
                            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                                Opsyra est né d'une vision simple : rendre la gestion de flotte accessible,
                                intelligente et performante pour tous.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-px bg-white/5" />
                        <div className="grid lg:grid-cols-2">
                            {/* Text */}
                            <div className="p-8 md:p-16 lg:border-r border-white/5">
                                <p className="text-sm text-white/40 mb-4">Notre Mission</p>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                                    Transformer la gestion de flotte industrielle
                                </h2>
                                <div className="space-y-4 text-white/50 leading-relaxed">
                                    <p>
                                        Opsyra est une plateforme de gestion de flotte industrielle conçue
                                        pour répondre aux défis logistiques modernes. Notre mission est de
                                        fournir aux entreprises les outils nécessaires pour un suivi rigoureux
                                        de leurs actifs.
                                    </p>
                                    <p>
                                        Nous croyons que la transparence des données est la clé de l'efficacité
                                        opérationnelle. En connectant les chauffeurs, les gestionnaires de fuel
                                        et les administrateurs sur une seule interface, nous éliminons les pertes
                                        d'information et optimisons les ressources.
                                    </p>
                                </div>
                            </div>

                            {/* Visual */}
                            <div className="p-8 md:p-16 bg-[#0a0b0c]/50">
                                <div className="space-y-4">
                                    {[
                                        { icon: Target, title: "Vision claire", desc: "Objectifs précis et mesurables", color: "blue" },
                                        { icon: CheckCircle2, title: "Excellence opérationnelle", desc: "Standards de qualité élevés", color: "green" },
                                        { icon: Rocket, title: "Innovation continue", desc: "Technologies de pointe", color: "purple" }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 py-4 transition-colors"
                                        >
                                            <div className={cn(
                                                "w-11 h-11 rounded-xl flex items-center justify-center",
                                                item.color === "blue" && "bg-blue-500/10",
                                                item.color === "green" && "bg-green-500/10",
                                                item.color === "purple" && "bg-purple-500/10"
                                            )}>
                                                <item.icon className={cn(
                                                    "w-5 h-5",
                                                    item.color === "blue" && "text-blue-400",
                                                    item.color === "green" && "text-green-400",
                                                    item.color === "purple" && "text-purple-400"
                                                )} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{item.title}</h3>
                                                <p className="text-sm text-white/40">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-white/5" />
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <p className="text-sm text-white/40 mb-4">Nos Valeurs</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Ce qui nous guide
                            </h2>
                            <p className="text-white/50 max-w-xl">
                                Les principes fondamentaux qui façonnent chaque décision et chaque fonctionnalité
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
                            {[
                                { icon: Shield, title: "Sécurité", desc: "La sécurité est au cœur de notre architecture. Rapports d'incidents instantanés et validation stricte.", color: "green" },
                                { icon: Zap, title: "Performance", desc: "Nous optimisons chaque aspect pour garantir des performances maximales et une disponibilité constante.", color: "yellow" },
                                { icon: Users, title: "Collaboration", desc: "Nous croyons en la puissance de la collaboration entre tous les acteurs de la chaîne logistique.", color: "blue" },
                                { icon: Sparkles, title: "Innovation", desc: "Nous repoussons constamment les limites pour apporter des solutions innovantes à nos clients.", color: "purple" }
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
                                        item.color === "green" && "bg-green-500/10",
                                        item.color === "yellow" && "bg-yellow-500/10",
                                        item.color === "blue" && "bg-blue-500/10",
                                        item.color === "purple" && "bg-purple-500/10"
                                    )}>
                                        <item.icon className={cn(
                                            "w-6 h-6",
                                            item.color === "green" && "text-green-400",
                                            item.color === "yellow" && "text-yellow-400",
                                            item.color === "blue" && "text-blue-400",
                                            item.color === "purple" && "text-purple-400"
                                        )} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-px bg-white/5" />
                        <div className="grid grid-cols-2 md:grid-cols-4">
                            {[
                                { value: "1000+", label: "Flottes gérées", icon: TrendingUp },
                                { value: "50%", label: "Réduction des coûts", icon: Award },
                                { value: "99.9%", label: "Disponibilité", icon: Zap },
                                { value: "24/7", label: "Support", icon: Globe }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "p-8 md:p-12 text-center border-white/5",
                                        i !== 3 && "border-r",
                                        i < 2 && "border-b md:border-b-0"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <stat.icon className="w-5 h-5 text-white/60" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-white/40">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="h-px bg-white/5" />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-[#111213] to-[#0a0b0c] rounded-2xl border border-white/10 p-12 md:p-16 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Rejoignez notre mission
                            </h2>
                            <p className="text-white/50 mb-8 max-w-lg mx-auto">
                                Faites partie de la révolution de la gestion de flotte.
                                Découvrez comment Opsyra peut transformer votre entreprise.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12">
                                    <Link to="/login">
                                        Commencer maintenant
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/5 rounded-full px-8 h-12 border border-white/10">
                                    <Link to="/contact">Nous contacter</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default About;
