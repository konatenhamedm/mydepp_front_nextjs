"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function LandingFooter() {
    return (
        <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 group">
                            <div className="w-20 h-20 bg-white rounded-[24px] p-2 flex items-center justify-center transition-transform group-hover:rotate-3 shadow-2xl">
                                <Image src="/images/new_Image/logo-depps.png" alt="DEPPS" width={80} height={80} className="object-contain" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tighter text-white">MYDEPPS</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">République de CI</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-light">
                            La Direction des Établissements Privés et des Professions Sanitaires assure le contrôle et l'excellence du secteur de la santé.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Navigation</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-blue-400 transition-colors">Accueil</Link></li>
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">À propos</Link></li>
                            <li><Link href="/services" className="hover:text-blue-400 transition-colors">Nos Services</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                            <li><Link href="/stats" className="hover:text-blue-400 transition-colors">Statistiques</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Contact Rapide</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex flex-col"><span className="text-slate-500 text-[10px] font-bold uppercase">Standard</span> <a href="tel:2720332150" className="hover:text-blue-400">27 20 33 21 50</a></li>
                            <li className="flex flex-col"><span className="text-slate-500 text-[10px] font-bold uppercase">Secrétariat</span> <a href="tel:0787589025" className="hover:text-blue-400">07 87 58 90 25</a></li>
                            <li className="flex flex-col"><span className="text-slate-500 text-[10px] font-bold uppercase">E-DEPPS</span> <a href="tel:0566056060" className="hover:text-blue-400">05 66 05 60 60</a></li>
                            <li className="flex flex-col"><span className="text-slate-500 text-[10px] font-bold uppercase">Email</span> <a href="mailto:secretariatdeps2@gmail.com" className="hover:text-blue-400">secretariatdeps2@gmail.com</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Réseaux Sociaux</h3>
                        <div className="flex gap-4">
                            <SocialIcon href="https://facebook.com" icon={<Facebook className="w-5 h-5" />} color="hover:bg-blue-600" />
                            <SocialIcon href="https://instagram.com" icon={<Instagram className="w-5 h-5" />} color="hover:bg-pink-600" />
                            <SocialIcon href="https://twitter.com" icon={<Twitter className="w-5 h-5" />} color="hover:bg-blue-400" />
                            <SocialIcon href="https://linkedin.com" icon={<Linkedin className="w-5 h-5" />} color="hover:bg-blue-800" />
                        </div>
                        <div className="pt-4">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Ministère de la Santé</p>
                            <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} MY DEPPS - République de Côte d'Ivoire. Tous droits réservés.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
                        <Link href="#" className="hover:text-white transition-colors">Mentions Légales</Link>
                        <Link href="#" className="hover:text-white transition-colors">Sécurité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ href, icon, color }: { href: string, icon: React.ReactNode, color: string }) {
    return (
        <a href={href} className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all ${color} hover:translate-y-[-4px]`}>
            {icon}
        </a>
    );
}
