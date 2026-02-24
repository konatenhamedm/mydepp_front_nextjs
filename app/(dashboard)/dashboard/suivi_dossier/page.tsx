"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, CheckCircle2, Clock,
    Search, ShieldCheck, FileText,
    AlertCircle
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";

export default function SuiviDossierPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const [loading, setLoading] = useState(true);
    const [workflow, setWorkflow] = useState<any[]>([]);

    useEffect(() => {
        const fetchWorkflow = async () => {
            if (!user?.personneId) return;
            try {
                const res = await apiFetch(`/ValidationWorkflow/${user.personneId}`);
                setWorkflow(res?.data || []);
            } catch (err) {
                console.error("Workflow fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkflow();
    }, [user?.personneId]);

    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* ── Header ── */}
                <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Suivi de mon dossier</h1>
                                    <p className="text-indigo-100 font-medium opacity-80">État d'avancement de votre processus d'accréditation</p>
                                </div>
                            </div>
                            <div className="px-5 py-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest">En cours de traitement</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Summary Card ── */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <h2 className="text-lg font-bold text-slate-800">Résumé du dossier</h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Global</p>
                                            <p className="text-sm font-bold text-slate-900">Vérification technique</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progression</p>
                                            <p className="text-sm font-bold text-slate-900">75% Complété</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-6 border-t border-slate-50">
                                    <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: '75%' }} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                        "Votre dossier est actuellement entre les mains de l'instructeur technique pour validation finale."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Workflow Steps ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-10 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-indigo-600" /> Étapes de validation
                            </h2>

                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

                                {loading ? (
                                    <div className="space-y-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-6 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                                                <div className="space-y-2 flex-grow">
                                                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                                                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : workflow.length === 0 ? (
                                    <div className="py-20 text-center space-y-4">
                                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto" />
                                        <p className="text-slate-400 font-medium">Aucune étape de validation enregistrée pour le moment.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {workflow.map((step, idx) => (
                                            <div key={idx} className="relative flex gap-8 group">
                                                <div className={`
                          relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                          ${idx === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' : 'bg-emerald-50 text-emerald-600'}
                        `}>
                                                    {idx === 0 ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-grow pt-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className={`font-bold transition-colors ${idx === 0 ? 'text-indigo-600 text-lg' : 'text-slate-800'}`}>
                                                            {step.etape}
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">
                                                            {step.createdAt ? new Date(step.createdAt).toLocaleDateString('fr-FR') : '—'}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm leading-relaxed ${idx === 0 ? 'text-slate-600 font-medium' : 'text-slate-500 italic'}`}>
                                                        {step.raison || "Étape validée avec succès par l'administration."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
}
