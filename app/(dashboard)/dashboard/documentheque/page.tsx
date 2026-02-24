"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, FileText, Download,
    Search, FileDown, FolderSearch,
    BookOpen, ExternalLink, Filter
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch, BASE_URL_UPLOAD } from "@/lib/axios";

export default function DocumenthequePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<any[]>([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await apiFetch("/adminDocument/");
                setDocuments(res?.data || []);
            } catch (err) {
                console.error("Docs fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* ── Header ── */}
                <div className="bg-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden">
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Documenthèque</h1>
                                <p className="text-rose-100 font-medium opacity-80">Ressources, guides officiels et documentations techniques</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Section ── */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un document, un guide..."
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-600/10 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Filtrer par :</span>
                            <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-all">Tous</button>
                            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Guides</button>
                            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Lois</button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-48 bg-slate-50 rounded-3xl animate-pulse" />
                                ))
                            ) : documents.length === 0 ? (
                                <div className="col-span-full py-32 text-center space-y-4">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                        <FolderSearch className="w-12 h-12" />
                                    </div>
                                    <p className="text-slate-400 font-medium">Aucun document n'est disponible pour le moment.</p>
                                </div>
                            ) : (
                                documents.map((doc, idx) => (
                                    <div key={idx} className="group bg-white border border-slate-100 p-6 rounded-[32px] hover:shadow-xl hover:shadow-rose-600/5 hover:-translate-y-1 transition-all flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                            <span className="px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-full">
                                                PDF
                                            </span>
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-rose-600 transition-colors">
                                                {doc.libelle || "Document sans titre"}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-light line-clamp-2">
                                                {doc.description || "Consultez ce document officiel pour plus d'informations sur les normes en vigueur."}
                                            </p>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Guide Officiel</span>
                                            </div>
                                            <a
                                                href={`${BASE_URL_UPLOAD}${doc.path?.path}/${doc.path?.alt}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
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
