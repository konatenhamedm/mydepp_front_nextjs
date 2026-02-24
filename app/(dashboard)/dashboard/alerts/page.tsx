"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Bell, BellOff,
    Search, CheckCircle2, Clock,
    MoreVertical, Trash2, Mail
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";

export default function AlertsPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) return;
            try {
                const res = await apiFetch(`/notification/by/${user.id}`);
                setNotifications(res?.data || []);
            } catch (err) {
                console.error("Notifications fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user?.id]);

    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* ── Header ── */}
                <div className="bg-amber-500 rounded-[32px] p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Centre d'alertes</h1>
                                <p className="text-amber-50 font-medium opacity-80">Restez informé des mises à jour de votre dossier</p>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2">
                            Tout marquer comme lu
                        </button>
                    </div>
                </div>

                {/* ── Notifications List ── */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une alerte..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100">Tous</button>
                            <button className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-all">Non lus</button>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="p-8 flex gap-6 animate-pulse">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex-shrink-0" />
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-4 bg-slate-50 rounded w-1/4" />
                                        <div className="h-3 bg-slate-50 rounded w-full" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="py-32 text-center space-y-4">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <BellOff className="w-12 h-12" />
                                </div>
                                <p className="text-slate-400 font-medium font-light">Aucune nouvelle alerte pour le moment.</p>
                            </div>
                        ) : (
                            notifications.map((notif, idx) => (
                                <div key={idx} className={`
                  p-8 flex gap-6 transition-all hover:bg-slate-50/50 group relative
                  ${!notif.isRead ? 'bg-amber-50/20' : ''}
                `}>
                                    {!notif.isRead && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-amber-500 rounded-r-full" />
                                    )}

                                    <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
                    ${!notif.isRead ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-400'}
                  `}>
                                        <Bell className="w-6 h-6" />
                                    </div>

                                    <div className="flex-grow pt-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-black tracking-tight ${!notif.isRead ? 'text-slate-900 group-hover:text-amber-600' : 'text-slate-600'} transition-colors`}>
                                                {notif.title || "Note Informative"}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {notif.createdAt || "Aujourd'hui"}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-slate-700 font-medium' : 'text-slate-500 font-light'}`}>
                                            {notif.libelle || "Une nouvelle mise à jour est disponible pour votre dossier. Veuillez consulter votre espace."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
}
