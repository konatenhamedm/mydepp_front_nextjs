"use client";

import React from "react";
import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import { Phone, Mail, Clock, Send, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
    const [formStatus, setFormStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        // Simulate API call
        setTimeout(() => {
            setFormStatus("success");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <LandingHeader />

            <main className="flex-grow pt-24 pb-16">
                {/* ── HERO SECTION ── */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="relative rounded-[40px] overflow-hidden bg-blue-600 p-10 md:p-16 text-center text-white shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                        <div className="relative z-10 space-y-5">
                            <Badge className="bg-white/20 text-blue-100 border-white/30 py-1.5 px-5 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold">Contactez-nous</Badge>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                Nous sommes à votre <br />
                                <span className="text-blue-200">entière disposition</span>
                            </h1>
                            <p className="text-lg text-blue-100/80 max-w-xl mx-auto font-light leading-relaxed">
                                Une question sur votre inscription ? Un besoin d'assistance technique ?
                                Notre équipe d'experts vous répond dans les meilleurs délais.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── CONTACT GRID ── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* 📍 INFO COLUMN */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-7 rounded-[28px] border border-slate-200 shadow-sm space-y-7">
                                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Nos Coordonnées</h3>

                                <div className="space-y-5">
                                    <ContactInfoItem
                                        icon={<Phone className="w-5 h-5 text-blue-600" />}
                                        title="Téléphones"
                                        content={
                                            <div className="space-y-1">
                                                <p className="flex justify-between"><span>Standard :</span> <a href="tel:2720332150" className="font-bold hover:text-blue-600 transition-colors">27 20 33 21 50</a></p>
                                                <p className="flex justify-between"><span>Secrétariat :</span> <a href="tel:0787589025" className="font-bold hover:text-blue-600 transition-colors">07 87 58 90 25</a></p>
                                                <p className="flex justify-between"><span>E-DEPPS :</span> <a href="tel:0566056060" className="font-bold hover:text-blue-600 transition-colors">05 66 05 60 60</a></p>
                                            </div>
                                        }
                                    />

                                    <ContactInfoItem
                                        icon={<Mail className="w-5 h-5 text-indigo-600" />}
                                        title="Email"
                                        content={<a href="mailto:secretariatdeps2@gmail.com" className="font-bold hover:text-blue-600 transition-all break-all text-xs">secretariatdeps2@gmail.com</a>}
                                    />

                                    <ContactInfoItem
                                        icon={<MapPin className="w-5 h-5 text-emerald-600" />}
                                        title="Siège Social"
                                        content="Tour C, 4ème étage. Abidjan, Côte d'Ivoire."
                                    />

                                    <ContactInfoItem
                                        icon={<Clock className="w-5 h-5 text-amber-500" />}
                                        title="Horaires"
                                        content={
                                            <div className="space-y-1">
                                                <p className="flex justify-between"><span>Lun - Ven :</span> <span className="font-bold">08:00 - 17:00</span></p>
                                                <p className="flex justify-between"><span>Samedi :</span> <span className="font-bold">08:00 - 12:00</span></p>
                                            </div>
                                        }
                                    />
                                </div>
                            </div>

                            {/* FAQ MINI PREVIEW */}
                            <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-7 rounded-[28px] text-white shadow-lg">
                                <h4 className="text-lg font-bold mb-3">Aide immédiate ?</h4>
                                <p className="text-slate-300 text-xs mb-5 leading-relaxed font-light">
                                    Consultez notre base de connaissances pour des réponses rapides.
                                </p>
                                <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest">
                                    FAQ
                                </button>
                            </div>
                        </div>

                        {/* ✉️ FORM COLUMN */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200 shadow-lg relative overflow-hidden">
                                {formStatus === "success" && (
                                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-3">Message Envoyé !</h2>
                                        <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm font-light leading-relaxed">
                                            Merci de nous avoir contactés. Votre message sera traité sous 24 à 48 heures ouvrables.
                                        </p>
                                        <button
                                            onClick={() => setFormStatus("idle")}
                                            className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg text-sm"
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Envoyez-nous un message</h2>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed">Remplissez le formulaire et nous vous recontacterons sous peu.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom Complet</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Jean Dupont"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="jean.dupont@exemple.com"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            placeholder="+225 00 00 00 00 00"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sujet</label>
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="inscription">Inscription en ligne</option>
                                            <option value="tech">Problème Technique</option>
                                            <option value="etab">Établissements Sanitaires</option>
                                            <option value="prof">Professions Sanitaires</option>
                                            <option value="other">Autre demande</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Votre Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Comment pouvons-nous vous aider ?"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm font-medium resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button
                                            disabled={formStatus === "submitting"}
                                            type="submit"
                                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {formStatus === "submitting" ? (
                                                <span className="text-sm">Traitement...</span>
                                            ) : (
                                                <>Envoyer le message <Send className="w-4 h-4" /></>
                                            )}
                                        </button>
                                        <p className="text-center text-[9px] text-slate-400 mt-5 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                                            <AlertCircle className="w-2.5 h-2.5" /> Données protégées par cryptage SSL
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

function ContactInfoItem({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 transition-transform hover:scale-105 shadow-sm">
                {icon}
            </div>
            <div className="space-y-0.5 flex-grow">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</h4>
                <div className="text-sm text-slate-700 leading-snug font-medium">{content}</div>
            </div>
        </div>
    );
}
