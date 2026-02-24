'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hospital, UserRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';

export default function InscriptionChoicePage() {
    const router = useRouter();
    const [selectedProfile, setSelectedProfile] = useState<'etablissement' | 'professionnel' | null>(null);

    const handleContinue = () => {
        if (selectedProfile === 'etablissement') {
            router.push('/inscription/etablissement');
        } else if (selectedProfile === 'professionnel') {
            router.push('/inscription/professionnel');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <LandingHeader />

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#0052cc 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {/* Glassmorphism Background Image */}
                <div
                    className="absolute inset-x-0 top-0 h-[50vh] bg-cover bg-center bg-no-repeat z-0"
                    style={{ backgroundImage: "url('/bg5.jpg')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/60 to-slate-50"></div>
                </div>

                <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">
                            Inscription E-DEPPS
                        </h1>
                        <p className="text-lg text-blue-50/90 font-medium">
                            Choisissez votre type de profil pour commencer votre démarche
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50 animate-in fade-in zoom-in duration-500 delay-200">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Créer votre compte
                            </h2>
                            <p className="text-slate-600">
                                Sélectionnez le profil qui correspond à votre activité
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            {/* Option Établissement */}
                            <div
                                onClick={() => setSelectedProfile('etablissement')}
                                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${selectedProfile === 'etablissement'
                                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/10'
                                    : 'border-slate-100 bg-white hover:border-blue-200'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedProfile === 'etablissement' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                                        }`}>
                                        <Hospital className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            Établissement de Santé
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Structure organisée pour fournir des services de santé (Clinique, Hôpital, Centre de santé...)
                                        </p>
                                    </div>
                                </div>
                                {selectedProfile === 'etablissement' && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <CheckCircle2 className="w-6 h-6 fill-blue-600 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Option Professionnel */}
                            <div
                                onClick={() => setSelectedProfile('professionnel')}
                                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${selectedProfile === 'professionnel'
                                    ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-600/10'
                                    : 'border-slate-100 bg-white hover:border-emerald-200'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedProfile === 'professionnel' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                                        }`}>
                                        <UserRound className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            Professionnel de Santé
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Personne qualifiée pour fournir des soins médicaux (Médecin, Infirmier, Spécialiste...)
                                        </p>
                                    </div>
                                </div>
                                {selectedProfile === 'professionnel' && (
                                    <div className="absolute top-4 right-4 text-emerald-600">
                                        <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Besoin d&apos;aide ? <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contactez le support</Link>
                            </p>
                            <button
                                onClick={handleContinue}
                                disabled={!selectedProfile}
                                className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Continuer
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Déjà inscrit ? <Link href="/connexion" className="text-blue-600 font-bold hover:underline">Connectez-vous ici</Link>
                    </p>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
