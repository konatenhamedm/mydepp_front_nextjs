"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/axios";
import { ClientOnly } from '@/components/ui/client-only';
import { RefreshCw, BarChart, PieChart as PieChartIcon, Calendar, Users, Globe, MapPin } from "lucide-react";
import {
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, Cell as ReCell
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function StatistiqueGeneralPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [filters, setFilters] = useState({
        periode: 'null',
        annee: 'null',
        mois: 'null',
        tranche: 'null'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters as any).toString();
            const res = await apiFetch(`/statistique/generale?${query}`, { method: "GET" });
            setData(res?.data || null);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading && !data) return <div className="p-8 text-center animate-pulse">Chargement des statistiques...</div>;

    return (
        <ClientOnly>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Statistiques Générales</h1>
                        <p className="text-slate-500 font-light">Analyse globale des données de la plateforme</p>
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <RefreshCw className="w-5 h-5" /> Actualiser
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Période</label>
                        <select
                            value={filters.periode}
                            onChange={(e) => handleFilterChange('periode', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="null">Toutes</option>
                            <option value="mois">Mois</option>
                            <option value="trimestre">Trimestre</option>
                            <option value="semestre">Semestre</option>
                            <option value="annee">Année</option>
                        </select>
                    </div>

                    {filters.periode === 'mois' && (
                        <div className="space-y-1 text-slate-400">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mois</label>
                            <select
                                value={filters.mois}
                                onChange={(e) => handleFilterChange('mois', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="null">Tous</option>
                                {["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
                                    <option key={i} value={String(i + 1)}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Année</label>
                        <select
                            value={filters.annee}
                            onChange={(e) => handleFilterChange('annee', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="null">Toutes</option>
                            {data?.all_annees?.map((y: any) => (
                                <option key={y.id} value={y.id}>{y.libelle}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={fetchData} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                        Appliquer
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Chart 1: Pays */}
                    <ChartWrapper title="Répartition par Pays" icon={<Globe className="w-5 h-5 text-blue-600" />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ReBarChart data={data?.pays || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                    {/* Chart 2: Professions */}
                    <ChartWrapper title="Répartition par Profession" icon={<PieChartIcon className="w-5 h-5 text-purple-600" />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data?.professions || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(data?.professions || []).map((entry: any, index: number) => (
                                        <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                    {/* Chart 3: Regions */}
                    <ChartWrapper title="Répartition par Région" icon={<MapPin className="w-5 h-5 text-emerald-600" />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ReBarChart data={data?.regions || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                    {/* Chart 4: Genre */}
                    <ChartWrapper title="Répartition par Genre" icon={<Users className="w-5 h-5 text-pink-600" />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data?.genres || []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label
                                >
                                    {(data?.genres || []).map((entry: any, index: number) => (
                                        <ReCell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                </div>
            </div>
        </ClientOnly>
    );
}

function ChartWrapper({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            </div>
            <div className="w-full">{children}</div>
        </div>
    );
}
