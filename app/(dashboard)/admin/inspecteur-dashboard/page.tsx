"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/axios";
import { useSession } from "next-auth/react";
import {
    Building, Clock, CheckCircle2, XCircle, Calendar,
    Search, Filter, Download, FileText
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { Badge } from "@/components/ui/badge";

export default function InspecteurDashboardPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({});
    const [items, setItems] = useState<any[]>([]);
    const [etablissements, setEtablissements] = useState<any[]>([]);
    const [filter, setFilter] = useState("etablissement");
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const user = session?.user as any;

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsUrl = user?.type && user?.id
                ? `/statistique/info-dashboard/by/typeuser/${user.type}/${user.id}`
                : '/statistique/info-dashboard';

            const [statsRes, profsRes, etabRes] = await Promise.all([
                apiFetch(statsUrl),
                apiFetch('/professionnel/'),
                apiFetch('/etablissement/')
            ]);

            setStats(statsRes?.data || {});
            setItems(profsRes?.data || []);
            setEtablissements(etabRes?.data || []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    const displayData = filter === "etablissement" ? etablissements : items;

    const filteredItems = displayData.filter(item => {
        const status = item.personne?.status;

        // Type Filter (if not etablissement)
        const matchesFilter = filter === "etablissement" || filter === "all" ||
            (filter === "attente" && status === "en_attente") ||
            (filter === "accepted" && status === "accepte") ||
            (filter === "rejected" && status === "rejete");

        // Status Filter
        const matchesStatus = !selectedStatus || status === selectedStatus;

        // Search
        const searchStr = search.toLowerCase();
        const name = (item.personne?.nom || "" + " " + item.personne?.prenoms || "" + " " + item.personne?.denomination || "").toLowerCase();
        const email = (item.email || "").toLowerCase();
        const matchesSearch = !search || name.includes(searchStr) || email.includes(searchStr);

        return matchesFilter && matchesStatus && matchesSearch;
    });

    return (
        <ClientOnly>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de bord Inspecteur</h1>
                        <p className="text-slate-500 font-light">Inspection et contrôle des établissements sanitaires</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                            <FileText className="w-4 h-4" /> Rapport PDF
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        active={filter === "etablissement"}
                        onClick={() => setFilter("etablissement")}
                        label="Établissements"
                        value={etablissements.length}
                        icon={<Building className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        active={filter === "attente"}
                        onClick={() => setFilter("attente")}
                        label="En attente"
                        value={stats.atttente || 0}
                        icon={<Clock className="w-5 h-5" />}
                        color="amber"
                    />
                    <StatCard
                        active={filter === "accepted"}
                        onClick={() => setFilter("accepted")}
                        label="Acceptés"
                        value={stats.accepte || 0}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        color="emerald"
                    />
                    <StatCard
                        active={filter === "rejected"}
                        onClick={() => setFilter("rejected")}
                        label="Rejetés"
                        value={stats.rejete || 0}
                        icon={<XCircle className="w-5 h-5" />}
                        color="rose"
                    />
                    <StatCard
                        active={false}
                        onClick={() => { }}
                        label="Aujourd'hui"
                        value={new Date().toLocaleDateString('fr-FR')}
                        icon={<Calendar className="w-5 h-5" />}
                        color="indigo"
                    />
                </div>

                {/* List Section */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Building className="w-6 h-6 text-indigo-600" />
                                Liste des {filter === "etablissement" ? "établissements" : "dossiers"}
                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100">{filteredItems.length} résultats</Badge>
                            </h2>

                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type :</span>
                            </div>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="etablissement">Établissements</option>
                                <option value="all">Tous les professionnels</option>
                                <option value="attente">En attente</option>
                                <option value="accepted">Accepté</option>
                                <option value="rejected">Rejeté</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="en_attente">En attente</option>
                                <option value="accepte">Accepté</option>
                                <option value="rejete">Rejeté</option>
                                <option value="valide">Validé</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">N°</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Entité / Nom</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Type / Profession</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date Création</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 animate-pulse">
                                            Chargement des données...
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-medium">
                                            Aucun résultat trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-6 font-bold text-slate-400 text-sm">{idx + 1}</td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 truncate max-w-[250px]">
                                                    {item.personne?.denomination || (item.personne?.nom + " " + item.personne?.prenoms)}
                                                </p>
                                                <p className="text-xs text-slate-500">{item.email || item.login}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-medium text-slate-700">{item.personne?.telephone || "—"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {item.personne?.typePersonne?.libelle || item.personne?.profession?.libelle || "—"}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StatusBadge status={item.personne?.status} />
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : "—"}
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

function StatCard({ label, value, icon, color, active, onClick }: { label: string, value: any, icon: React.ReactNode, color: string, active: boolean, onClick: () => void }) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500",
        amber: "bg-amber-50 text-amber-600 border-amber-100 ring-amber-500",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500",
        rose: "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500"
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-[24px] border transition-all text-left flex flex-col gap-4 group hover:scale-[1.02] ${colors[color]} ${active ? 'ring-2 ring-offset-2' : ''}`}
        >
            <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
                <p className="text-2xl font-black tracking-tight">{value}</p>
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
        accepte: { label: "Accepté", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
        rejete: { label: "Rejeté", color: "bg-rose-100 text-rose-700 border-rose-200" },
        valide: { label: "Validé", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
        a_jour: { label: "À jour", color: "bg-blue-100 text-blue-700 border-blue-200" },
    };

    const config = configs[status] || { label: status || "Inconnu", color: "bg-slate-100 text-slate-600 border-slate-200" };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
            {config.label}
        </span>
    );
}
