import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { AppLogo } from './AppLogo';
import { motion, AnimatePresence } from 'framer-motion';

export function PublicNavbar() {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Fermer le menu mobile quand on change de page
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Fermer le menu quand on clique en dehors (mais pas sur le bouton hamburger)
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    const navLinks = [
        { path: '/', label: 'Produit' },
        { path: '/about', label: 'À propos' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#08090a]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto h-12 md:h-16 px-4 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90 flex-shrink-0">
                        <AppLogo size={28} showText={false} />
                        <span className="text-white font-bold text-md tracking-tight hidden sm:inline">Opsyra</span>
                    </Link>

                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-[13px] font-medium transition-colors ${isActive(link.path)
                                    ? 'text-white'
                                    : 'text-[#8a8f98] hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="text-[13px] font-medium text-[#8a8f98] hover:text-white transition-colors px-3 py-1.5 hidden md:block"
                            >
                                Connexion
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <Button asChild variant="ghost" className="h-8 px-3 md:px-4 text-[12px] md:text-[13px] font-medium rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                                <Link to="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild className="h-8 px-3 md:px-4 text-[12px] md:text-[13px] font-medium rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <Link to="/login">Démarrer</Link>
                            </Button>
                        )}

                        {/* Mobile Menu Button - Two bars animated */}
                        <button
                            ref={buttonRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(prev => !prev);
                            }}
                            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white w-8 h-8 flex flex-col justify-center items-center gap-1.5 relative"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <motion.span
                                className="w-5 h-0.5 bg-white rounded-full origin-center"
                                animate={{
                                    rotate: mobileMenuOpen ? 45 : 0,
                                    y: mobileMenuOpen ? 3.5 : 0,
                                }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                            />
                            <motion.span
                                className="w-5 h-0.5 bg-white rounded-full origin-center"
                                animate={{
                                    rotate: mobileMenuOpen ? -45 : 0,
                                    y: mobileMenuOpen ? -4 : 0,
                                }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-12 md:hidden left-0 right-0 z-40 bg-[#08090a]/95 backdrop-blur-md border-b border-white/10"
                        ref={menuRef}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                        ease: 'easeOut'
                                    }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-2 rounded-lg text-md font-semibold transition-colors ${isActive(link.path)
                                            ? 'text-white bg-white/10'
                                            : 'text-[#8a8f98] hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            {!isAuthenticated && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: navLinks.length * 0.05,
                                        ease: 'easeOut'
                                    }}
                                >
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 rounded-lg text-md font-medium text-[#8a8f98] hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer pour le contenu fixe */}
            <div className="h-12 md:h-16" />
        </>
    );
}

