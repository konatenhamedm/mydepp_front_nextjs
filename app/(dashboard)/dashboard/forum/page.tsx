"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, MessageSquare, Send,
    Search, Users, Star,
    MessageCircle, ArrowRight, Plus,
    Hash, Clock
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";

export default function ForumPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<any[]>([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await apiFetch("/forum/");
                setTopics(res?.data || []);
            } catch (err) {
                console.error("Forum fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* ── Header ── */}
                <div className="bg-purple-600 rounded-[32px] p-8 text-white shadow-xl shadow-purple-600/20 relative overflow-hidden">
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Forum Communautaire</h1>
                                <p className="text-purple-100 font-medium opacity-80">Espace d'échange entre professionnels de santé</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-purple-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-900/20 flex items-center gap-2 hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Nouveau Sujet
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ── Sidebar Categories ── */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 px-2">Catégories</h2>
                            <div className="space-y-1">
                                {["Général", "Assistance Technique", "Réglementation", "Partage d'Expérience"].map((cat, i) => (
                                    <button key={i} className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                    ${i === 0 ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}>
                                        <Hash className="w-4 h-4 opacity-50" />
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-lg shadow-purple-600/20">
                            <Users className="w-10 h-10 mb-4 opacity-50" />
                            <h3 className="font-bold text-lg mb-2">Besoin d'aide ?</h3>
                            <p className="text-purple-100 text-xs leading-relaxed opacity-80 mb-6">
                                Consultez les sujets épinglés ou contactez directement l'assistance via le formulaire dédié.
                            </p>
                            <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/30 hover:bg-white/30 transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* ── Topics List ── */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-[32px] p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                            <Search className="w-5 h-5 text-slate-400 ml-4" />
                            <input
                                type="text"
                                placeholder="Rechercher une discussion..."
                                className="flex-grow py-3 bg-transparent focus:outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-32 bg-white border border-slate-100 rounded-[32px] animate-pulse" />
                                ))
                            ) : topics.length === 0 ? (
                                <div className="bg-white border border-slate-100 rounded-[40px] py-32 text-center space-y-4">
                                    <MessageCircle className="w-16 h-16 text-slate-100 mx-auto" />
                                    <p className="text-slate-400 font-medium">Lancez la première discussion !</p>
                                </div>
                            ) : (
                                topics.map((topic, idx) => (
                                    <div key={idx} className="group bg-white border border-slate-100 p-8 rounded-[40px] hover:shadow-xl hover:shadow-purple-600/5 hover:-translate-y-1 transition-all cursor-pointer">
                                        <div className="flex items-start gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                                <MessageSquare className="w-7 h-7" />
                                            </div>
                                            <div className="flex-grow pt-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                            {topic.title || "Discussion sans sujet"}
                                                        </h3>
                                                        {idx === 0 && (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                                                <Star className="w-2 h-2 fill-current" /> Populaire
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                        <Clock className="w-3.5 h-3.5" /> {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString('fr-FR') : "2j ago"}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-light line-clamp-2 mb-6 leading-relaxed">
                                                    {topic.content || "Cliquez pour lire le contenu complet de cette discussion et participer aux échanges avec les autres membres."}
                                                </p>
                                                <div className="flex items-center justify-between pointer-events-none">
                                                    <div className="flex items-center -space-x-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                                        ))}
                                                        <span className="ml-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">+12 participants</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-purple-600">
                                                        <span className="text-xs font-black uppercase tracking-widest">Voir plus</span>
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
}
