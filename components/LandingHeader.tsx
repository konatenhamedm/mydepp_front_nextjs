"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function LandingHeader() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group relative">
                    <div className="w-20 h-20 relative flex items-center justify-center">
                        <Image src="/images/new_Image/logo-depps.png" alt="MYDEPPS Logo" width={80} height={80} className="object-contain" priority />
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-semibold hover:text-blue-600 transition-colors">Accueil</Link>
                    <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">À propos</Link>
                    <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">E-DEPPS</Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">Contact</Link>
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/dashboard" className="px-5 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                                Tableau de bord
                            </Link>
                            <button onClick={() => signOut()} className="px-5 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/inscription" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                                Inscription
                            </Link>
                            <Link href="/connexion" className="px-5 py-2.5 border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 rounded-xl transition-colors">
                                Connexion
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg p-4 flex flex-col gap-4">
                    <Link href="/" className="px-4 py-2 font-semibold text-blue-600 bg-blue-50 rounded-lg">Accueil</Link>
                    <Link href="/about" className="px-4 py-2 font-medium text-slate-600">À propos</Link>
                    <Link href="/services" className="px-4 py-2 font-medium text-slate-600">E-DEPPS</Link>
                    <Link href="/contact" className="px-4 py-2 font-medium text-slate-600">Contact</Link>
                    <div className="h-px bg-slate-100 my-2" />
                    {session ? (
                        <>
                            <Link href="/dashboard" className="px-4 py-2 text-center bg-blue-600 text-white font-semibold rounded-lg">Tableau de bord</Link>
                            <button onClick={() => signOut()} className="px-4 py-2 text-center border border-slate-200 text-slate-600 font-semibold rounded-lg">Déconnexion</button>
                        </>
                    ) : (
                        <>
                            <Link href="/inscription" className="px-4 py-2 text-center bg-blue-600 text-white font-semibold rounded-lg">Inscription</Link>
                            <Link href="/connexion" className="px-4 py-2 text-center border border-blue-600 text-blue-600 font-semibold rounded-lg">Connexion</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
