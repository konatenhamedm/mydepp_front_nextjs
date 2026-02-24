"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, CreditCard, Download,
    Search, CheckCircle2, AlertCircle,
    Calendar, ArrowRight, Filter
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";

export default function HistoriquePaiementPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user?.id) return;
            try {
                const res = await apiFetch(`/paiement/historique/by/user/${user.id}`);
                setPayments(res?.data || []);
            } catch (err) {
                console.error("Payment history fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [user?.id]);

    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* ── Header ── */}
                <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Historique des paiements</h1>
                                <p className="text-emerald-100 font-medium opacity-80">Consultez et téléchargez vos justificatifs de paiement</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-5 py-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                                <Download className="w-4 h-4" /> Exporter PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total payé</p>
                            <p className="text-xl font-black text-slate-900">{payments.reduce((acc, p) => acc + (p.montant || 0), 0).toLocaleString()} FCFA</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paiements validés</p>
                            <p className="text-xl font-black text-slate-900">{payments.length} reçus</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dernier paiement</p>
                            <p className="text-sm font-black text-slate-900">{payments[0]?.createdAt ? new Date(payments[0].createdAt).toLocaleDateString('fr-FR') : "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* ── Table & Filter ── */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un paiement..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all text-sm font-medium"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filtrer par date</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Réf. Transaction</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Montant</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6">
                                                <div className="h-6 bg-slate-50 rounded w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                                    <CreditCard className="w-10 h-10" />
                                                </div>
                                                <p className="text-slate-400 font-medium">Aucune transaction trouvée pour le moment.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                                                        TX
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{p.ref_paiment || "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Mobile Money / Visa</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-900">{(p.montant || 0).toLocaleString()} FCFA</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-medium text-slate-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : "—"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                                    Réussi
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
}
