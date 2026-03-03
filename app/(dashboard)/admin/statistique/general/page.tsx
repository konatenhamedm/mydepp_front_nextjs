"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/axios";
import { ClientOnly } from "@/components/ui/client-only";
import { PageHeader } from "@/components/ui/page-components";
import {
    RefreshCw, Globe, MapPin, Users, BarChart2,
    Calendar, TrendingUp, Filter, XCircle, ChevronDown
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Palette de couleurs cohérente ────────────────────────────────────────────
const PALETTE = [
    "#0052CC", "#0065FF", "#2684FF", "#4C9AFF",
    "#00B8D9", "#00C7E6", "#36B37E", "#57D9A3",
    "#FF8B00", "#FFAB00", "#FF5630", "#FF7452",
    "#6554C0", "#8777D9", "#3B7A57", "#5BAD92"
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toChartData(arr: any[]): { name: string; value: number }[] {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => ({
        name: item.name ?? item.libelle ?? "—",
        value: item.y ?? item.value ?? item.nombre ?? 0,
    }));
}

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const TRIMESTRES = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre", "4ème Trimestre"];
const SEMESTRES = ["1er Semestre", "2ème Semestre"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-slate-800 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-[#0052CC] font-semibold">
                    {p.value.toLocaleString("fr-FR")} professionnel{p.value > 1 ? "s" : ""}
                </p>
            ))}
        </div>
    );
}

// ─── Chart Wrapper ────────────────────────────────────────────────────────────
function ChartCard({ title, icon, children, fullWidth = false, count }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; fullWidth?: boolean; count?: number;
}) {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden ${fullWidth ? "col-span-full" : ""}`}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[#0052CC]">{icon}</span>
                    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                </div>
                {count !== undefined && (
                    <span className="text-xs font-bold bg-[#EBF2FF] text-[#0052CC] px-2.5 py-0.5 rounded-full">
                        {count} entr{count > 1 ? "ées" : "ée"}
                    </span>
                )}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChartSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-40 bg-slate-50 rounded-lg" />
        </div>
    );
}

// ─── Bar Chart Component ───────────────────────────────────────────────────────
function SimpleBarChart({ data, vertical = false }: { data: any[]; vertical?: boolean }) {
    if (!data.length) return (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            Aucune donnée disponible
        </div>
    );

    const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 15);

    if (vertical) {
        return (
            <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 32)}>
                <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name" type="category"
                        axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        width={120}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                        {sorted.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sorted} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-35} textAnchor="end" interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
                    {sorted.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── Donut Chart Component ─────────────────────────────────────────────────────
function DonutChart({ data }: { data: any[] }) {
    if (!data.length) return (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            Aucune donnée disponible
        </div>
    );

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius={52} outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, ""]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                {data.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                            <span className="text-slate-600 truncate">{entry.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 flex-shrink-0">
                            {entry.value} <span className="font-normal text-slate-400">({((entry.value / total) * 100).toFixed(0)}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Tableau Croisé — Lieu diplôme × Civilité × Tranches d'âge ───────────────
const AGE_RANGES = ["< 25 ans", "25-34 ans", "35-44 ans", "45-54 ans", "55 ans et plus"];

function buildCroiseData(tableau_croise: any[]) {
    if (!Array.isArray(tableau_croise) || !tableau_croise.length) return null;

    const lieuxMap = new Map<number, {
        id: number; nom: string;
        civilites: Map<number, { id: number; libelle: string; counts: Record<string, number>; total: number }>;
        totals: { ageRanges: Record<string, number>; general: number };
    }>();
    const totals = {
        ageRanges: Object.fromEntries(AGE_RANGES.map(r => [r, 0])),
        general: 0,
    };

    for (const item of tableau_croise) {
        const lieuId = item.lieu?.id;
        const civId = item.civilite?.id;
        const tranche = String(item.tranche_age);
        const count = Number(item.count ?? 0);
        if (!lieuId || !civId || !AGE_RANGES.includes(tranche) || isNaN(count)) continue;

        if (!lieuxMap.has(lieuId)) {
            lieuxMap.set(lieuId, {
                id: lieuId,
                nom: item.lieu.nom ?? "—",
                civilites: new Map(),
                totals: { ageRanges: Object.fromEntries(AGE_RANGES.map(r => [r, 0])), general: 0 },
            });
        }
        const lieu = lieuxMap.get(lieuId)!;
        if (!lieu.civilites.has(civId)) {
            lieu.civilites.set(civId, {
                id: civId,
                libelle: item.civilite.libelle ?? "—",
                counts: Object.fromEntries(AGE_RANGES.map(r => [r, 0])),
                total: 0,
            });
        }
        const civ = lieu.civilites.get(civId)!;
        civ.counts[tranche] += count;
        civ.total += count;
        lieu.totals.ageRanges[tranche] += count;
        lieu.totals.general += count;
        totals.ageRanges[tranche] += count;
        totals.general += count;
    }

    return { lieux: Array.from(lieuxMap.values()).map(l => ({ ...l, civilites: Array.from(l.civilites.values()) })), totals };
}

function exportCroiseCSV(processedData: NonNullable<ReturnType<typeof buildCroiseData>>) {
    let csv = `Lieu,Civilité,${AGE_RANGES.join(",")},Total\n`;
    for (const lieu of processedData.lieux) {
        for (const civ of lieu.civilites) {
            csv += `"${lieu.nom}","${civ.libelle}",${AGE_RANGES.map(r => civ.counts[r] || 0).join(",")},${civ.total}\n`;
        }
        csv += `"${lieu.nom}","Total",${AGE_RANGES.map(r => lieu.totals.ageRanges[r] || 0).join(",")},${lieu.totals.general}\n`;
    }
    csv += `"Total général","",${AGE_RANGES.map(r => processedData.totals.ageRanges[r] || 0).join(",")},${processedData.totals.general}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tableau-croise-diplome_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function TableauCroise({ statistiques }: { statistiques: any }) {
    const tableau_croise = statistiques?.tableau_croise ?? statistiques;
    const processed = buildCroiseData(Array.isArray(tableau_croise) ? tableau_croise : []);

    if (!processed || processed.lieux.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <BarChart2 className="w-10 h-10 opacity-20" />
                <p className="text-sm">Aucune donnée disponible pour les critères sélectionnés</p>
            </div>
        );
    }

    const fmt = (n: number) => (isNaN(n) ? "0" : n.toLocaleString("fr-FR"));

    return (
        <div>
            {/* Export button */}
            <div className="flex justify-end mb-3">
                <button
                    onClick={() => exportCroiseCSV(processed)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exporter CSV
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                    { label: "Lieux diplôme", value: processed.lieux.length, color: "blue" },
                    ...AGE_RANGES.slice(0, 3).map(r => ({
                        label: r, value: processed.totals.ageRanges[r] || 0, color: "slate"
                    })),
                ].map((s, i) => (
                    <div key={i} className={`rounded-lg border p-3 text-center ${s.color === "blue" ? "bg-[#EBF2FF] border-blue-100 text-[#0052CC]" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                        <p className="text-xl font-black">{fmt(s.value)}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Pivot table */}
            <div className="overflow-auto max-h-[480px] rounded-lg border border-slate-200">
                <table className="w-full text-xs border-collapse min-w-[700px]">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th rowSpan={2} className="px-3 py-2.5 bg-[#0052CC] text-white font-semibold text-left border border-white/20 min-w-[120px]">
                                Lieu d'obtention
                            </th>
                            <th rowSpan={2} className="px-3 py-2.5 bg-[#0052CC] text-white font-semibold text-left border border-white/20 min-w-[90px]">
                                Civilité
                            </th>
                            <th colSpan={AGE_RANGES.length} className="px-3 py-2 bg-[#0041A8] text-white font-semibold text-center border border-white/20">
                                Tranches d'âge
                            </th>
                            <th rowSpan={2} className="px-3 py-2.5 bg-[#0052CC] text-white font-semibold text-center border border-white/20">
                                Total
                            </th>
                        </tr>
                        <tr>
                            {AGE_RANGES.map(r => (
                                <th key={r} className="px-2 py-2 bg-[#0041A8] text-white font-semibold text-center border border-white/20 whitespace-nowrap">
                                    {r}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {processed.lieux.map((lieu, li) => (
                            <React.Fragment key={lieu.id}>
                                {lieu.civilites.map((civ, ci) => (
                                    <tr key={civ.id} className={`${ci === 0 ? "bg-blue-50/40" : ""} hover:bg-slate-50 transition-colors border-b border-slate-100`}>
                                        {ci === 0 && (
                                            <td
                                                rowSpan={lieu.civilites.length}
                                                className="px-3 py-2.5 font-semibold text-slate-700 border-r border-slate-200 bg-slate-50 align-middle"
                                            >
                                                {lieu.nom || "—"}
                                            </td>
                                        )}
                                        <td className="px-3 py-2 text-slate-600 border-r border-slate-100">{civ.libelle}</td>
                                        {AGE_RANGES.map(r => (
                                            <td key={r} className="px-3 py-2 text-center text-slate-700 border-r border-slate-100">
                                                {civ.counts[r] > 0 ? (
                                                    <span className="font-semibold text-[#0052CC]">{fmt(civ.counts[r])}</span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-3 py-2 text-center font-bold text-slate-800">{fmt(civ.total)}</td>
                                    </tr>
                                ))}
                                {/* Sous-total par lieu */}
                                <tr className="bg-slate-100 border-b-2 border-slate-300">
                                    <td colSpan={2} className="px-3 py-2 font-bold text-slate-700 text-xs uppercase tracking-wide">
                                        Total — {lieu.nom}
                                    </td>
                                    {AGE_RANGES.map(r => (
                                        <td key={r} className="px-3 py-2 text-center font-bold text-slate-700">
                                            {fmt(lieu.totals.ageRanges[r] || 0)}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-center font-black text-[#0052CC]">{fmt(lieu.totals.general)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-[#0052CC]">
                            <td colSpan={2} className="px-3 py-3 font-black text-white text-xs uppercase tracking-wide">
                                Total Général
                            </td>
                            {AGE_RANGES.map(r => (
                                <td key={r} className="px-3 py-3 text-center font-black text-white">
                                    {fmt(processed.totals.ageRanges[r] || 0)}
                                </td>
                            ))}
                            <td className="px-3 py-3 text-center font-black text-white text-sm">
                                {fmt(processed.totals.general)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StatistiqueGeneralPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    const [periode, setPeriode] = useState("null");
    const [annee, setAnnee] = useState("null");
    const [mois, setMois] = useState("null");
    const [tranche, setTranche] = useState("null");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams({ periode, annee, mois, tranche });
            const res = await apiFetch(`/statistique/generale?${params.toString()}`, { method: "GET" });
            setData(res?.data || null);
        } catch (err) {
            console.error("Stats error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [periode, annee, mois, tranche]);

    useEffect(() => { fetchData(); }, []); // Load once on mount

    const resetFilters = () => {
        setPeriode("null");
        setAnnee("null");
        setMois("null");
        setTranche("null");
    };

    // ── Map API data to recharts format (API uses { name, y } not { name, value }) ──
    const chartData = {
        pays: toChartData(data?.pays || []),
        professions: toChartData(data?.professions || []),
        regions: toChartData(data?.regions || []),
        villes: toChartData(data?.villes || []),
        genres: toChartData(data?.genres || []),
        annees: toChartData(data?.annees || []),
        tranches_age: toChartData(data?.tranches_age || []),
    };

    const anneesList: any[] = data?.all_annees || [];
    const statistiques: any = data?.statistiques ?? null; // { tableau_croise: [], total, par_lieu, par_civilite, par_tranche_age }
    const hasCroise = !!statistiques?.tableau_croise?.length;

    const selectCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all";

    return (
        <ClientOnly>
            <div className="space-y-5 pb-10">
                {/* Header */}
                <PageHeader
                    title="Statistiques Générales"
                    description="Analyse globale des données de la plateforme"
                    action={
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm font-semibold hover:bg-[#0041A8] transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Actualiser
                        </button>
                    }
                />

                {/* Filters */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-[#0052CC]" />
                            <h2 className="text-sm font-semibold text-slate-700">Filtres de période</h2>
                        </div>
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Réinitialiser
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Période</label>
                            <select value={periode} onChange={e => setPeriode(e.target.value)} className={selectCls}>
                                <option value="null">Toutes les périodes</option>
                                <option value="mois">Par mois</option>
                                <option value="trimestre">Par trimestre</option>
                                <option value="semestre">Par semestre</option>
                                <option value="annee">Par année</option>
                            </select>
                        </div>

                        {periode === "mois" && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mois</label>
                                <select value={mois} onChange={e => setMois(e.target.value)} className={selectCls}>
                                    <option value="null">Tous</option>
                                    {MOIS.map((m, i) => (
                                        <option key={i} value={String(i + 1)}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {periode === "trimestre" && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trimestre</label>
                                <select value={tranche} onChange={e => setTranche(e.target.value)} className={selectCls}>
                                    <option value="null">Tous</option>
                                    {TRIMESTRES.map((t, i) => (
                                        <option key={i} value={String(i + 1)}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {periode === "semestre" && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Semestre</label>
                                <select value={tranche} onChange={e => setTranche(e.target.value)} className={selectCls}>
                                    <option value="null">Tous</option>
                                    {SEMESTRES.map((s, i) => (
                                        <option key={i} value={String(i + 1)}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Année</label>
                            <select value={annee} onChange={e => setAnnee(e.target.value)} className={selectCls}>
                                <option value="null">Toutes</option>
                                {anneesList.map((y: any) => (
                                    <option key={y.id} value={String(y.id)}>{y.libelle}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="h-[38px] flex items-center justify-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm font-semibold hover:bg-[#0041A8] transition-colors disabled:opacity-60"
                        >
                            {loading
                                ? <RefreshCw className="w-4 h-4 animate-spin" />
                                : <TrendingUp className="w-4 h-4" />
                            }
                            Appliquer
                        </button>
                    </div>

                    {/* Date range display */}
                    {data?.dates && (
                        <p className="mt-3 text-xs text-slate-400">
                            📅 Période analysée : <span className="font-semibold text-slate-600">{data.dates.debut}</span> → <span className="font-semibold text-slate-600">{data.dates.fin}</span>
                        </p>
                    )}
                </div>

                {/* Error state */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Impossible de charger les statistiques. Vérifiez la connexion au serveur.
                        <button onClick={fetchData} className="ml-auto underline">Réessayer</button>
                    </div>
                )}

                {/* Charts Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                                <ChartSkeleton />
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* 1 — Par pays */}
                        <ChartCard
                            title="Répartition par pays"
                            icon={<Globe className="w-4 h-4" />}
                            count={chartData.pays.length}
                        >
                            <SimpleBarChart data={chartData.pays} />
                        </ChartCard>

                        {/* 2 — Par profession (donut) */}
                        <ChartCard
                            title="Répartition par profession"
                            icon={<BarChart2 className="w-4 h-4" />}
                            count={chartData.professions.length}
                        >
                            <DonutChart data={chartData.professions} />
                        </ChartCard>

                        {/* 3 — Par région (horizontal bars) */}
                        <ChartCard
                            title="Répartition par région"
                            icon={<MapPin className="w-4 h-4" />}
                            count={chartData.regions.length}
                        >
                            <SimpleBarChart data={chartData.regions} vertical={true} />
                        </ChartCard>

                        {/* 4 — Par ville */}
                        <ChartCard
                            title="Répartition par ville"
                            icon={<MapPin className="w-4 h-4" />}
                            count={chartData.villes.length}
                        >
                            <SimpleBarChart data={chartData.villes} vertical={true} />
                        </ChartCard>

                        {/* 5 — Par genre/civilité (donut) */}
                        <ChartCard
                            title="Répartition par civilité / genre"
                            icon={<Users className="w-4 h-4" />}
                            count={chartData.genres.length}
                        >
                            <DonutChart data={chartData.genres} />
                        </ChartCard>

                        {/* 6 — Par tranche d'âge */}
                        <ChartCard
                            title="Répartition par tranche d'âge"
                            icon={<Users className="w-4 h-4" />}
                            count={chartData.tranches_age.length}
                        >
                            <SimpleBarChart data={chartData.tranches_age} />
                        </ChartCard>

                        {/* 7 — Par année */}
                        <ChartCard
                            title="Répartition par année d'inscription"
                            icon={<Calendar className="w-4 h-4" />}
                            count={chartData.annees.length}
                            fullWidth
                        >
                            <SimpleBarChart data={chartData.annees} />
                        </ChartCard>

                        {/* 8 — Tableau croisé Lieu diplôme × Civilité × Tranches d'âge */}
                        <ChartCard
                            title="Répartition par lieu d'obtention du diplôme"
                            icon={<BarChart2 className="w-4 h-4" />}
                            count={statistiques?.total ?? 0}
                            fullWidth
                        >
                            <TableauCroise statistiques={statistiques} />
                        </ChartCard>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <BarChart2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Aucune donnée statistique</p>
                        <p className="text-slate-400 text-sm mt-1">Sélectionnez vos filtres et cliquez sur Appliquer</p>
                        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm font-semibold hover:bg-[#0041A8] transition-colors">
                            Charger les données
                        </button>
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}
