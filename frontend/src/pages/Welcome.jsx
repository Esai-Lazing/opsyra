import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Truck,
    Shield,
    Fuel,
    BarChart3,
    Zap,
    Users,
    Activity,
    Sparkles,
    ArrowRight,
    Lock,
    Globe,
    Rocket,
    MousePointer2,
    Check,
    Settings,
    Gauge,
} from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { BlurText } from '@/components/ui/blur-text';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { AppLogo } from '@/components/AppLogo';
import { cn } from "@/lib/utils";
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const Welcome = () => {
    useDocumentTitle('Accueil');
    return (
        <div className="dark min-h-screen bg-[#08090a] text-white font-sans antialiased selection:bg-primary/30">
            <PublicNavbar />

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-20 md:pt-50 pb-10 md:pb-20 px-6">
                    <div className="max-w-7xl mx-auto text-start space-y-8">
                        <div className='flex items-center justify-center md:justify-start gap-2'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center justify-center md:justify-start text-center md:text-left gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-linear-muted"
                            >
                                {/* <Sparkles className="w-3.5 h-3.5 text-blue-400" /> */}
                                <span>V1.0 is now live</span>
                                <div className="w-[1px] h-3 bg-white/20 mx-1" />
                                <Link to="/about" className="text-white hover:text-blue-400 transition-colors inline-flex items-center gap-1 group">
                                    En savoir plus <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </motion.div>

                        </div>

                        <h1 className="text-4xl hidden md:block md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] md:leading-[1.02]">
                            <BlurText
                                text="Opsyra est la plateforme"
                                delay={0.01}
                                animateBy="words"
                                direction="bottom"
                                duration={0.3}
                                className="block"
                            />
                            <span className="text-white">
                                <BlurText
                                    text="de gestion nouvelle génération."
                                    delay={0.01}
                                    animateBy="words"
                                    duration={0.5}
                                    direction="bottom"
                                />
                            </span>
                        </h1>

                        <h1 className="text-4xl text-center md:hidden block font-bold tracking-tighter leading-[1.05] md:leading-[1.02]">
                            <BlurText
                                text="Opsyra plateforme "
                                delay={0.01}
                                animateBy="words"
                                direction="bottom"
                                duration={0.3}
                                className="block"
                            />
                            <span className="text-white">
                                <BlurText
                                    text="de gestion nouvelle génération."
                                    delay={0.01}
                                    animateBy="words"
                                    duration={0.5}
                                    direction="bottom"
                                    className="block"
                                />
                            </span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-lg md:text-xl text-center md:text-left text-linear-muted max-w-2xl leading-relaxed"
                        >
                            Optimisez votre flotte, suivez vos consommations et gérez vos équipes avec
                            une précision inégalée. Conçu pour les entreprises qui exigent la performance.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4"
                        >
                            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-lg text-[17px] font-semibold group shadow-[0_0_20px_rgba(255,255,255,0.15)] w-auto">
                                <Link to="/login">
                                    Commencer <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 group rounded-lg hover:text-white text-[17px] font-semibold w-auto">
                                <Link to="/about">
                                    En savoir plus <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Product Preview Mockup */}
                <ProductMockup />

                {/* Features Section */}
                <section className="relative">
                    {/* Top border */}
                    <div className="h-px bg-white/5" />

                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="px-6 py-20 md:py-28 border-b border-white/5">
                            <p className="text-sm text-white/40 mb-4">Gestion de flotte</p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl">
                                Contrôle total de votre flotte logistique
                            </h2>
                            <p className="text-lg text-white/60 mt-4 max-w-2xl">
                                <span className="text-white">Opsyra est une plateforme de gestion</span> de flotte logistique qui permet de contrôler et de gérer votre flotte de véhicules.
                            </p>
                        </div>

                        {/* Main Feature Block */}
                        <div className="border-b border-white/5">
                            <div className="grid lg:grid-cols-2">
                                {/* Text Content */}
                                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center lg:border-r border-white/5">
                                    <h3 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight">
                                        Tableau de bord intelligent
                                    </h3>
                                    <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-md">
                                        Visualisez l'ensemble de votre flotte en temps réel.
                                        Statistiques, alertes et indicateurs clés — tout au même endroit.
                                    </p>
                                </div>

                                {/* Visual Mockup */}
                                <div className="p-8 md:p-12 lg:p-16 bg-[#0a0b0c]/50">
                                    <div className="relative bg-[#111213] rounded-xl border border-white/10 overflow-hidden">
                                        {/* Mini Dashboard */}
                                        <div className="p-6">
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                {[
                                                    { label: "Véhicules", value: "128" },
                                                    { label: "En route", value: "94" }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white/[0.03] rounded-lg p-4">
                                                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                                                        <p className="text-2xl font-semibold text-white">{stat.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-end gap-1 h-16">
                                                {[40, 65, 45, 80, 55, 70, 50, 85].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ height: `${h}%` }}
                                                        className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-400/20 rounded-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Two Column Features */}
                        <div className="grid md:grid-cols-2">
                            {/* Feature 1 */}
                            <div className="p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-white/5">
                                <h3 className="text-xl md:text-2xl font-semibold mb-3">
                                    Suivi GPS en temps réel
                                </h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Localisez chaque véhicule avec une précision au mètre.
                                    Historique des trajets et alertes de zone inclus.
                                </p>

                                {/* Map Mockup */}
                                <div className="relative h-48 bg-[#0a0b0c] rounded-xl border border-white/5 overflow-hidden">
                                    {/* Grid lines */}
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                                        backgroundSize: '40px 40px'
                                    }} />

                                    {/* Vehicle dots */}
                                    {[
                                        { x: 25, y: 30 },
                                        { x: 60, y: 55 },
                                        { x: 45, y: 75 },
                                        { x: 80, y: 35 }
                                    ].map((pos, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 md:p-12 lg:p-16 border-b border-white/5">
                                <h3 className="text-xl md:text-2xl font-semibold mb-3">
                                    Gestion du carburant
                                </h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Analysez la consommation, détectez les anomalies
                                    et optimisez vos coûts énergétiques.
                                </p>

                                {/* Fuel Mockup */}
                                <div className="relative h-48 bg-[#0a0b0c] rounded-xl border border-white/5 overflow-hidden p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <Fuel className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-semibold text-white">2,340 L</p>
                                            <p className="text-sm text-green-400">-12% ce mois</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "CAM-042", value: 85 },
                                            { label: "CAM-018", value: 62 },
                                            { label: "CAM-091", value: 45 }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs text-white/40 w-16">{item.label}</span>
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500/60 to-green-400/40 rounded-full"
                                                        style={{ width: `${item.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid md:grid-cols-2">
                            {/* Feature 3 */}
                            <div className="p-8 md:p-12 lg:p-16 md:border-r border-white/5">
                                <h3 className="text-xl md:text-2xl font-semibold mb-3">
                                    Maintenance prédictive
                                </h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Anticipez les pannes grâce à l'analyse des données.
                                    Réduisez les temps d'arrêt de 67%.
                                </p>

                                {/* Alerts Mockup */}
                                <div className="space-y-2">
                                    {[
                                        { status: "warning", text: "Révision moteur", vehicle: "CAM-042", time: "3 jours" },
                                        { status: "success", text: "Pneus vérifiés", vehicle: "CAM-018", time: "Terminé" }
                                    ].map((alert, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-4 py-3 border border-white/5">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                alert.status === "warning" ? "bg-yellow-400" : "bg-green-400"
                                            )} />
                                            <span className="text-sm text-white/70 flex-1">{alert.text}</span>
                                            <span className="text-xs text-white/30">{alert.vehicle}</span>
                                            <span className="text-xs text-white/40">{alert.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-8 md:p-12 lg:p-16">
                                <h3 className="text-xl md:text-2xl font-semibold mb-3">
                                    Rapports instantanés
                                </h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Exportez vos données en un clic.
                                    PDF, Excel ou API — vous choisissez le format.
                                </p>

                                {/* Export Mockup */}
                                <div className="relative h-32 bg-[#0a0b0c] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                                    <div className="flex items-center gap-4">
                                        {[
                                            { ext: "PDF", color: "red" },
                                            { ext: "XLS", color: "green" },
                                            { ext: "API", color: "blue" }
                                        ].map((format, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-14 h-14 rounded-lg border flex items-center justify-center text-xs font-medium",
                                                    format.color === "red" && "bg-red-500/10 border-red-500/20 text-red-400",
                                                    format.color === "green" && "bg-green-500/10 border-green-500/20 text-green-400",
                                                    format.color === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                )}
                                            >
                                                {format.ext}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom border */}
                    <div className="h-px bg-white/5" />
                </section>


                {/* Secondary Highlight Section */}
                <SecondaryHighlight />

                {/* Bottom CTA */}
                <BottomCTA />
            </main>

            <Footer />
        </div>
    );
};



// Secondary Highlight Section with scroll animations
const SecondaryHighlight = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [selectedFeature, setSelectedFeature] = useState(0);

    const features = [
        {
            id: 0,
            icon: Settings,
            title: "Maintenance Prédictive",
            description: "Anticipez les pannes grâce à nos algorithmes d'analyse avancée.",
            color: "blue",
            visualTitle: "Maintenance Intelligente",
            visualSubtitle: "Prédiction de défaillance",
            stats: [{ label: "Pannes évitées", value: "94%" }, { label: "Temps d'arrêt", value: "-67%" }]
        },
        {
            id: 1,
            icon: Fuel,
            title: "Gestion du Carburant",
            description: "Réduisez le gaspillage et optimisez chaque litre consommé.",
            color: "green",
            visualTitle: "Optimisation Carburant",
            visualSubtitle: "Consommation en temps réel",
            stats: [{ label: "Économies", value: "+23%" }, { label: "CO₂ réduit", value: "-18%" }]
        },
        {
            id: 2,
            icon: Gauge,
            title: "Suivi en Temps Réel",
            description: "Visualisez l'état de chaque véhicule instantanément.",
            color: "purple",
            visualTitle: "Monitoring Live",
            visualSubtitle: "Tracking GPS précis",
            stats: [{ label: "Véhicules actifs", value: "128" }, { label: "Précision", value: "99.9%" }]
        }
    ];

    const currentFeature = features[selectedFeature];

    return (
        <section ref={ref} className="pt-32 px-6 relative overflow-hidden">
            {/* Top Gradient Fade */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0d0e]/30 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                        className="space-y-10 order-2 lg:order-1"
                    >
                        <div className="space-y-6">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-linear-muted uppercase tracking-widest text-[10px] py-1 px-3">
                                <Rocket className="w-3 h-3 mr-2" />
                                Centre de Commande
                            </Badge>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1]">
                                Gérez vos engins<br />
                                <span className="text-white">
                                    comme jamais.
                                </span>
                            </h2>
                            <p className="text-lg text-linear-muted leading-relaxed max-w-md">
                                Opsyra n'est pas qu'un simple outil de suivi. C'est le centre de commande ultime de votre flotte logistique.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {features.map((feature, index) => (
                                <motion.button
                                    key={feature.title}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                                    onClick={() => setSelectedFeature(index)}
                                    className={cn(
                                        "w-full py-2 group relative after:content-[''] after:block after:w-1 after:h-6 after:rounded-full after:-mt-1 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 px-4 flex gap-4 items-start transition-all duration-300 text-left cursor-pointer",
                                        selectedFeature === index
                                            ? feature.color === "blue" ? "after:bg-blue-400" : feature.color === "green" ? "after:bg-green-400" : "after:bg-purple-400"
                                            : "after:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                        selectedFeature === index ? "scale-110" : "group-hover:scale-105",
                                        feature.color === "blue" && "bg-blue-500/10 text-blue-400",
                                        feature.color === "green" && "bg-green-500/10 text-green-400",
                                        feature.color === "purple" && "bg-purple-500/10 text-purple-400"
                                    )}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-semibold mb-1 transition-colors duration-300",
                                            selectedFeature === index ? "text-white" : "text-white/70"
                                        )}>
                                            {feature.title}
                                        </p>
                                        <p className="text-sm text-linear-muted leading-relaxed">{feature.description}</p>
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-4 transition-all duration-300",
                                        selectedFeature === index
                                            ? feature.color === "blue" ? "bg-blue-400" : feature.color === "green" ? "bg-green-400" : "bg-purple-400"
                                            : "bg-white/20"
                                    )} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative aspect-square">
                            {/* Main Visual Container - Style Mockup */}
                            <div className="relative w-full h-full bg-[#0c0d0e] rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                                {/* Window Chrome */}
                                <div className="h-11 bg-[#111213] border-b border-white/5 flex items-center px-4">
                                    {/* Traffic Lights */}
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                    </div>
                                    {/* Title */}
                                    <div className="flex-1 text-center">
                                        <span className="text-xs text-white/40 font-medium">Opsyra — {currentFeature.visualTitle}</span>
                                    </div>
                                    {/* Placeholder */}
                                    <div className="w-14" />
                                </div>

                                {/* App Content */}
                                <div className="flex h-[calc(100%-44px)]">
                                    {/* Sidebar */}
                                    <div className="w-14 bg-[#0a0b0c] border-r border-white/5 flex flex-col items-center py-4 gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            selectedFeature === 0 ? "bg-blue-500/20" : "bg-white/5"
                                        )}>
                                            <Settings className={cn("w-4 h-4", selectedFeature === 0 ? "text-blue-400" : "text-white/40")} />
                                        </div>
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            selectedFeature === 1 ? "bg-green-500/20" : "bg-white/5"
                                        )}>
                                            <Fuel className={cn("w-4 h-4", selectedFeature === 1 ? "text-green-400" : "text-white/40")} />
                                        </div>
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            selectedFeature === 2 ? "bg-purple-500/20" : "bg-white/5"
                                        )}>
                                            <Gauge className={cn("w-4 h-4", selectedFeature === 2 ? "text-purple-400" : "text-white/40")} />
                                        </div>
                                        <div className="flex-1" />
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-white/40" />
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <motion.div
                                        key={selectedFeature}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-1 p-5 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h4 className="text-sm font-semibold text-white mb-0.5">{currentFeature.visualTitle}</h4>
                                                <p className="text-[11px] text-white/40">{currentFeature.visualSubtitle}</p>
                                            </div>
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-medium",
                                                currentFeature.color === "blue" && "bg-blue-500/20 text-blue-400",
                                                currentFeature.color === "green" && "bg-green-500/20 text-green-400",
                                                currentFeature.color === "purple" && "bg-purple-500/20 text-purple-400"
                                            )}>
                                                En direct
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            {currentFeature.stats.map((stat, idx) => (
                                                <motion.div
                                                    key={stat.label}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                    className="bg-white/[0.02] border border-white/5 rounded-xl p-3"
                                                >
                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                                                    <p className={cn(
                                                        "text-xl font-bold",
                                                        currentFeature.color === "blue" && "text-blue-400",
                                                        currentFeature.color === "green" && "text-green-400",
                                                        currentFeature.color === "purple" && "text-purple-400"
                                                    )}>
                                                        {stat.value}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Dynamic Content Based on Feature */}
                                        {selectedFeature === 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-2"
                                            >
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Alertes récentes</p>
                                                {[
                                                    { status: "warning", text: "Révision moteur - CAM-042", time: "Dans 3 jours" },
                                                    { status: "success", text: "Pneus vérifiés - CAM-018", time: "Terminé" },
                                                    { status: "info", text: "Vidange programmée - CAM-091", time: "Semaine proch." }
                                                ].map((alert, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + i * 0.1 }}
                                                        className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-3 py-2"
                                                    >
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            alert.status === "warning" && "bg-yellow-400",
                                                            alert.status === "success" && "bg-green-400",
                                                            alert.status === "info" && "bg-blue-400"
                                                        )} />
                                                        <span className="text-[11px] text-white/70 flex-1">{alert.text}</span>
                                                        <span className="text-[10px] text-white/30">{alert.time}</span>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {selectedFeature === 1 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Consommation hebdomadaire</p>
                                                <div className="flex items-end gap-1.5 h-20">
                                                    {[65, 45, 80, 55, 70, 40, 90].map((h, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}%` }}
                                                            transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                                                            className="flex-1 bg-gradient-to-t from-green-500/20 to-green-400/40 rounded-t-sm"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                                                        <span key={i} className="text-[9px] text-white/30 flex-1 text-center">{d}</span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {selectedFeature === 2 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="relative h-24 bg-white/[0.02] rounded-xl overflow-hidden"
                                            >
                                                {/* Mini Map Grid */}
                                                <div className="absolute inset-0 opacity-30">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className="absolute w-full h-px bg-white/10" style={{ top: `${(i + 1) * 16.66}%` }} />
                                                    ))}
                                                    {[...Array(8)].map((_, i) => (
                                                        <div key={i} className="absolute w-px h-full bg-white/10" style={{ left: `${(i + 1) * 12.5}%` }} />
                                                    ))}
                                                </div>
                                                {/* Vehicle Dots */}
                                                {[
                                                    { x: 25, y: 30 },
                                                    { x: 60, y: 55 },
                                                    { x: 45, y: 70 },
                                                    { x: 80, y: 25 }
                                                ].map((pos, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.4 + i * 0.1 }}
                                                        className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-50" />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Bottom CTA with scroll animation
const BottomCTA = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="max-w-7xl mx-auto py-20 md:py-40 md:pb-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className=""
            >
                <div className="relative overflow-hidden group">
                    <div className="relative z-10 space-y-8 flex flex-col md:flex-row justify-between items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="hidden md:block text-2xl md:text-4xl font-bold tracking-tight">
                                Gérez votre flotte aujourd'hui.
                                <br />
                                Optimisez demain.
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-center md:hidden text-4xl md:text-4xl font-bold tracking-tight">
                                Gérez votre flotte
                                <br />
                                en toute simplicité.
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full md:w-auto"
                        >
                            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-lg w-full md:w-auto px-5 h-11 text-base font-semibold group">
                                <Link to="/login">
                                    Commencer maintenant
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="text-white hover:text-white hover:bg-white/5 rounded-lg w-full md:w-auto px-5 h-11 text-base font-semibold border border-white/10 hover:border-white/20 transition-colors">
                                <Link to="/contact">Contacter un expert</Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const ProductMockup = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -15]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
    const opacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);

    return (
        <section ref={containerRef} className="pb-40 px-4 md:px-6 hidden lg:block perspective-[2500px] relative">
            <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                    rotateX,
                    scale,
                    opacity,
                    transformStyle: 'preserve-3d'
                }}
                className="max-w-7xl mx-auto relative"
            >
                {/* Linear.app style container with gradient border */}
                <div className="relative">
                    {/* Main container */}
                    <div className="relative bg-[#0a0b0c] rounded-lg border border-white/15 overflow-hidden">
                        {/* Window Chrome */}
                        <div className="h-11 bg-gradient-to-b from-[#1a1b1c] to-[#141516] border-b border-white/10 flex items-center px-5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.5)]" />
                                <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.5)]" />
                                <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.5)]" />
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-3">
                                <span className="text-[13px] text-white/60 font-medium">Opsyra</span>
                                <span className="text-[13px] text-white/20">—</span>
                                <span className="text-[13px] text-white/40">Tableau de bord</span>
                            </div>
                            <div className="w-20" />
                        </div>

                        {/* Dashboard Content */}
                        <div className="flex min-h-[520px] md:min-h-[600px]">
                            {/* Sidebar */}
                            <div className="w-[240px] bg-gradient-to-b from-[#0c0d0e] to-[#08090a] border-r border-white/5 p-5 hidden lg:flex flex-col">
                                {/* Logo */}
                                <div className="flex items-center gap-3 mb-10 px-2">
                                    <AppLogo />
                                    <div>
                                        <span className="text-sm font-semibold text-white block">Opsyra</span>
                                        <span className="text-[10px] text-white/30">Fleet Management</span>
                                    </div>
                                </div>

                                {/* Nav Items */}
                                <div className="space-y-1 flex-1">
                                    {[
                                        { icon: BarChart3, label: "Tableau de bord", active: true },
                                        { icon: Truck, label: "Véhicules", active: false, count: "128" },
                                        { icon: Fuel, label: "Carburant", active: false },
                                        { icon: Users, label: "Personnel", active: false, count: "256" },
                                        { icon: Activity, label: "Rapports", active: false }
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                                item.active
                                                    ? "bg-white/10 text-white shadow-inner shadow-white/5"
                                                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="flex-1">{item.label}</span>
                                            {item.count && (
                                                <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{item.count}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* User */}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                            AD
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">Admin</p>
                                            <p className="text-[10px] text-white/30">Gestionnaire</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#0a0b0c] to-[#08090a] relative">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Tableau de bord</h2>
                                        <p className="text-sm text-white/40">Aperçu en temps réel de votre flotte et opérations</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg">Aujourd'hui</span>
                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            En ligne
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: "Engins actifs", value: "128", change: "+12.5%", up: true, icon: Activity },
                                        { label: "Camions en service", value: "94", change: "+8.2%", up: true, icon: Truck },
                                        { label: "Personnel actif", value: "256", change: "+3.1%", up: true, icon: Users },
                                        { label: "Incidents ouverts", value: "3", change: "-67%", up: false, icon: Shield }
                                    ].map((stat, i) => (
                                        <div
                                            key={i}
                                            className="group bg-gradient-to-br from-[#141516] to-[#111213] rounded-xl border border-white/5 p-5 hover:border-white/15 transition-all hover:shadow-lg hover:shadow-white/5"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{stat.label}</p>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    stat.up ? "bg-emerald-500/10" : "bg-rose-500/10"
                                                )}>
                                                    <stat.icon className={cn("w-4 h-4", stat.up ? "text-emerald-400" : "text-rose-400")} />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-3xl font-bold text-white">{stat.value}</span>
                                                <span className={cn(
                                                    "text-sm font-semibold flex items-center gap-1",
                                                    stat.up ? "text-emerald-400" : "text-rose-400"
                                                )}>
                                                    {stat.up ? "↑" : "↓"} {stat.change}
                                                </span>
                                            </div>
                                            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        stat.up ? "bg-gradient-to-r from-emerald-500/50 to-emerald-400/30" : "bg-gradient-to-r from-rose-500/50 to-rose-400/30"
                                                    )}
                                                    style={{ width: stat.up ? '70%' : '30%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Row */}
                                <div className="grid lg:grid-cols-7 gap-6">
                                    {/* Main Chart */}
                                    <div className="lg:col-span-4 bg-gradient-to-br from-[#141516] to-[#111213] rounded-xl border border-white/5 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Consommation Carburant</h3>
                                                <p className="text-xs text-white/40 mt-1">Évolution sur 30 jours • Total: 12,450 L</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[11px] text-white/40 px-3 py-1.5 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">7j</span>
                                                <span className="text-[11px] text-blue-400 px-3 py-1.5 bg-blue-500/15 rounded-lg border border-blue-500/20">30j</span>
                                                <span className="text-[11px] text-white/40 px-3 py-1.5 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">90j</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-1 h-36">
                                            {[45, 60, 35, 75, 55, 80, 45, 65, 85, 50, 70, 90, 55, 75, 60, 82, 68].map((h, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: `${h}%` }}
                                                    className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400/60 rounded-sm hover:from-blue-500 hover:to-blue-300/80 transition-all cursor-pointer relative group/bar"
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 text-black text-[9px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                        {Math.round(h * 12)}L
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-3 px-1">
                                            <span className="text-[10px] text-white/30">1 Déc</span>
                                            <span className="text-[10px] text-white/30">15 Déc</span>
                                            <span className="text-[10px] text-white/30">30 Déc</span>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="lg:col-span-3 bg-gradient-to-br from-[#141516] to-[#111213] rounded-xl border border-white/5 p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Activités Récentes</h3>
                                                <p className="text-xs text-white/40 mt-1">Dernières 24 heures</p>
                                            </div>
                                            <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded">Voir tout</span>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { user: "JD", name: "Jean Dupont", action: "Ravitaillement effectué", value: "120L", time: "Il y a 2h", color: "blue" },
                                                { user: "ML", name: "Marie Leblanc", action: "Maintenance planifiée", value: "CAM-042", time: "Il y a 3h", color: "yellow" },
                                                { user: "PC", name: "Pierre Caron", action: "Livraison complétée", value: "Mission #847", time: "Il y a 5h", color: "green" },
                                                { user: "SB", name: "Sophie Bernard", action: "Nouveau rapport", value: "Carburant", time: "Il y a 6h", color: "purple" }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 group/item hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors">
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border",
                                                        item.color === "blue" && "bg-blue-500/20 border-blue-500/30 text-blue-400",
                                                        item.color === "yellow" && "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
                                                        item.color === "green" && "bg-green-500/20 border-green-500/30 text-green-400",
                                                        item.color === "purple" && "bg-purple-500/20 border-purple-500/30 text-purple-400"
                                                    )}>
                                                        {item.user}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white font-medium truncate">{item.name}</p>
                                                        <p className="text-[11px] text-white/40">{item.action} • <span className="text-white/60">{item.value}</span></p>
                                                    </div>
                                                    <span className="text-[10px] text-white/30">{item.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};



export default Welcome;
