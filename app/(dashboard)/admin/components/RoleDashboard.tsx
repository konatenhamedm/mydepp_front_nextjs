"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiFetch } from "@/lib/axios";
import { useSession } from "next-auth/react";
import {
    Folder, Clock, CheckCircle2, XCircle, ShieldCheck,
    Calendar, Building2, Download, FileText, EyeOff, Eye,
    RefreshCw, TrendingUp, Banknote, Users, FileSpreadsheet
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons
} from "@/components/ui/page-components";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DashboardMode = "dossiers" | "comptable";

interface RoleDashboardProps {
    title: string;
    subtitle: string;
    mode?: DashboardMode;
    showEtablissements?: boolean;
    defaultFilter?: string;
    allowedCards?: string[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    en_attente: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    attente: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    accepte: { label: "Accepté", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejete: { label: "Rejeté", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    valide: { label: "Validé", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    a_jour: { label: "À jour", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    refuse: { label: "Refusé", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    renouvellement: { label: "Renouvelé", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    oep_dossier_imputer: { label: "Imputé (OEP)", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    oep_visite_effectue_attente_validation_directrice: { label: "Visite effectuée", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    acp_dossier_attente_validation_directrice: { label: "Attente Validation", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    imputation_conforme: { label: "Conforme", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    imputation_non_conforme: { label: "Non Conforme", cls: "bg-rose-50 text-rose-600 border-rose-200" },
};

function StatusPill({ status }: { status?: string }) {
    const cfg = STATUS_CFG[status ?? ""] ?? { label: status ?? "—", cls: "bg-slate-100 text-slate-900 border-slate-200" };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
    blue: "bg-blue-50   text-blue-600   border-blue-100   ring-blue-400",
    amber: "bg-amber-50  text-amber-600  border-amber-100  ring-amber-400",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-400",
    rose: "bg-rose-50   text-rose-600   border-rose-100   ring-rose-400",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-400",
    purple: "bg-purple-50 text-purple-600 border-purple-100 ring-purple-400",
    green: "bg-green-50  text-green-600  border-green-100  ring-green-400",
    slate: "bg-slate-50  text-slate-900  border-slate-200  ring-slate-400",
};

interface StatCardProps {
    label: string; value: any; icon: React.ReactNode;
    color: string; active: boolean; onClick: () => void; isDate?: boolean;
}

function StatCard({ label, value, icon, color, active, onClick, isDate = false }: StatCardProps) {
    if (isDate) {
        return (
            <div className="p-3.5 rounded-xl border bg-gradient-to-br from-[#0052CC] to-indigo-700 text-white flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">{icon}</div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/95">{label}</p>
                    <p className="text-sm font-bold mt-0.5">{value}</p>
                </div>
            </div>
        );
    }
    return (
        <button
            onClick={onClick}
            className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all hover:shadow-sm active:scale-[0.98] ${COLOR_MAP[color] ?? COLOR_MAP.slate} ${active ? "ring-2 ring-offset-1" : ""}`}
        >
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-950">{label}</p>
                <p className="text-lg font-black tracking-tight mt-0.5">{value}</p>
            </div>
        </button>
    );
}

// ─── Initiales avatar ─────────────────────────────────────────────────────────
function Avatar({ nom, prenoms }: { nom?: string; prenoms?: string }) {
    const initials = ((nom?.[0] ?? "") + (prenoms?.[0] ?? "")).toUpperCase() || "?";
    return (
        <div className="w-8 h-8 rounded-lg bg-[#EBF2FF] text-[#0052CC] flex items-center justify-center font-black text-xs flex-shrink-0">
            {initials}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RoleDashboard({
    title, subtitle, mode = "dossiers", showEtablissements = false, defaultFilter = "all", allowedCards
}: RoleDashboardProps) {
    const { data: session } = useSession();
    const user = session?.user as any;

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({});
    const [professionnels, setProfessionnels] = useState<any[]>([]);
    const [etablissements, setEtablissements] = useState<any[]>([]);
    const [professions, setProfessions] = useState<any[]>([]);
    const [comptableStats, setComptableStats] = useState<any>({});
    const [showAmount, setShowAmount] = useState(false);
    const isInstructor = user?.type?.includes("INSTRUCTEUR");

    const filteredProfessionnels = useMemo(() => {
        if (!user?.id || !isInstructor) return professionnels;
        return professionnels.filter(item => String(item.personne?.imputationData?.id) === String(user.id));
    }, [professionnels, user, isInstructor]);

    const filteredEtablissements = useMemo(() => {
        if (!user?.id || !isInstructor) return etablissements;
        return etablissements.filter(item => String(item.personne?.imputationData?.id) === String(user.id));
    }, [etablissements, user, isInstructor]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [filter, setFilter] = useState(defaultFilter);
    const [search, setSearch] = useState("");
    const [selectedProfession, setSelectedProfession] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const statsUrl = `/statistique/info-dashboard/by/typeuser/${user.type}/${user.id}`;
            const reqs: Promise<any>[] = [
                apiFetch(statsUrl),
                apiFetch("/professionnel/"),
                apiFetch("/profession/"),
            ];
            if (showEtablissements) reqs.push(apiFetch("/etablissement/"));

            const results = await Promise.allSettled(reqs);
            const get = (r: PromiseSettledResult<any>) => r.status === "fulfilled" ? r.value : null;

            const [statsRes, profsRes, jobsRes, etabRes] = results.map(get);
            setStats(statsRes?.data || {});
            setProfessionnels(profsRes?.data || []);
            setProfessions(jobsRes?.data || []);
            if (showEtablissements && etabRes) setEtablissements(etabRes?.data || []);
            if (mode === "comptable") setComptableStats(statsRes?.data || {});
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.type, showEtablissements, mode]);

    useEffect(() => { if (session) fetchData(); }, [session]);
    useEffect(() => { setCurrentPage(1); }, [filter, search, selectedProfession, selectedStatus]);

    // ── Filtered data ──────────────────────────────────────────────────────────
    const isEtabView = filter === "etablissement";
    const sourceData = isEtabView ? filteredEtablissements : filteredProfessionnels;

    const filteredItems = sourceData.filter(item => {
        const status = item.personne?.status;
        const matchesType =
            filter === "all" || filter === "etablissement" ||
            (filter === "attente" && (status === "en_attente" || status === "attente" || status === "oep_dossier_imputer" || status === "acp_dossier_attente_validation_directrice")) ||
            (filter === "accepted" && (status === "accepte" || status === "imputation_conforme")) ||
            (filter === "rejected" && (status === "rejete" || status === "refuse" || status === "imputation_non_conforme")) ||
            (filter === "validated" && (status === "valide" || status === "oep_visite_effectue_attente_validation_directrice")) ||
            (filter === "a_jour" && status === "a_jour") ||
            (filter === "refuse" && status === "refuse") ||
            (filter === "renouvellement" && status === "renouvellement");

        const matchesProfession = !selectedProfession || isEtabView ||
            String(item.personne?.profession?.id) === selectedProfession;
        const matchesStatus = !selectedStatus || status === selectedStatus;
        const q = search.toLowerCase();
        const name = `${item.personne?.nom ?? ""} ${item.personne?.prenoms ?? ""}`.toLowerCase();
        const matchesSearch = !search || name.includes(q) || (item.email ?? "").toLowerCase().includes(q);

        return matchesType && matchesProfession && matchesStatus && matchesSearch;
    });

    const paginatedItems = filteredItems.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    // ── Export functions ──────────────────────────────────────────────────────
    const exportToCSV = async () => {
        try {
            const XLSX = await import("xlsx");
            const exportData = filteredItems.map((item, idx) => {
                if (isEtabView) {
                    return {
                        "N°": idx + 1,
                        "Entité / Dénomination": item.personne?.denomination || "—",
                        "Email": item.email || "—",
                        "Téléphone": item.personne?.telephone || item.personne?.number || "—",
                        "Statut": STATUS_CFG[item.personne?.status || ""]?.label || item.personne?.status || "—",
                        "Date": item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "—"
                    };
                }
                return {
                    "N°": idx + 1,
                    "Nom & Prénoms": `${item.personne?.nom ?? ""} ${item.personne?.prenoms ?? ""}`.trim() || "—",
                    "Contact": item.personne?.telephone || item.personne?.number || "—",
                    "Email": item.email || "—",
                    "Profession": item.personne?.profession?.libelle || "—",
                    "Statut": STATUS_CFG[item.personne?.status || ""]?.label || item.personne?.status || "—",
                    "Date": item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "—"
                };
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `export_${isEtabView ? "etablissements" : "professionnels"}_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting to CSV", error);
        }
    };

    const exportToPDF = async () => {
        try {
            const [jsPDFModule, autoTableModule] = await Promise.all([
                import("jspdf"),
                import("jspdf-autotable")
            ]);
            const jsPDF = jsPDFModule.default;
            const autoTable = autoTableModule.default;
            const doc = new jsPDF("landscape");
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // 1. En-tête officiel
            doc.setFontSize(8);
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "bold");
            doc.text("RÉPUBLIQUE DE CÔTE D'IVOIRE", 14, 15);
            doc.setFont("helvetica", "normal");
            doc.text("Union - Discipline - Travail", 14, 20);
            doc.setDrawColor(200);
            doc.line(14, 23, 60, 23);

            doc.setFontSize(8);
            doc.text("MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE", 14, 28);
            doc.text("ET DE LA COUVERTURE MALADIE UNIVERSELLE", 14, 32);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 82, 204);
            doc.text("DIRECTION DES ÉTABLISSEMENTS PRIVÉS", 14, 38);
            doc.text("ET PROFESSIONS SANITAIRES (DEPPS)", 14, 42);

            // 2. Logo au centre
            try {
                // Usage of MyDepp logo directly from internet to ensure it loads synchronously or fallback
                doc.addImage("https://mydepps.pages.dev/_files/logo-depps.png", "PNG", pageWidth / 2 - 15, 18, 28, 28);
            } catch (error) {
                // ignore if image fails to load synchronously
            }

            // 3. Titre du document à droite
            doc.setFontSize(15);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(title.toUpperCase(), pageWidth - 14, 30, { align: "right" });

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, pageWidth - 14, 38, { align: "right" });

            if (search) {
                doc.setTextColor(0, 82, 204);
                doc.text(`Filtre de recherche : "${search}"`, pageWidth - 14, 44, { align: "right" });
            }

            const headers = isEtabView
                ? ["N°", "Entité / Dénomination", "Email", "Téléphone", "Statut", "Date"]
                : ["N°", "Nom & Prénoms", "Contact", "Profession", "Statut", "Date"];

            const body = filteredItems.map((item, idx) => {
                const dateRaw = item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "—";
                const stat = STATUS_CFG[item.personne?.status || ""]?.label || item.personne?.status || "—";
                if (isEtabView) {
                    return [
                        idx + 1,
                        item.personne?.denomination || "—",
                        item.email || "—",
                        item.personne?.telephone || item.personne?.number || "—",
                        stat,
                        dateRaw
                    ];
                }
                return [
                    idx + 1,
                    `${item.personne?.nom ?? ""} ${item.personne?.prenoms ?? ""}`.trim() || "—",
                    `${item.personne?.telephone || "—"}\n${item.email || "—"}`,
                    item.personne?.profession?.libelle || "—",
                    stat,
                    dateRaw
                ];
            });

            autoTable(doc, {
                head: [headers],
                body: body,
                startY: 60,
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    textColor: [40, 40, 40],
                    lineColor: [240, 240, 240],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [0, 82, 204],
                    textColor: 255,
                    fontStyle: "bold",
                    halign: 'left'
                },
                columnStyles: {
                    0: { cellWidth: 15 }, // N°
                    5: { halign: 'right' } // Date
                },
                alternateRowStyles: { fillColor: [250, 252, 255] },
                margin: { top: 60, right: 14, bottom: 25, left: 14 },
                didDrawPage: function (data: any) {
                    // Pied de page
                    doc.setFontSize(7);
                    doc.setTextColor(150);
                    const footerY = pageHeight - 12;
                    doc.text("DEPPS - DIRECTION DES ÉTABLISSEMENTS PRIVÉS ET PROFESSIONS SANITAIRES", pageWidth / 2, footerY, { align: "center" });
                    doc.text("Document officiel généré par la plateforme MyDEPP - Sygape CI", pageWidth / 2, footerY + 4, { align: "center" });
                    doc.text(`Page ${data.pageNumber}`, pageWidth - 14, footerY + 4, { align: "right" });
                }
            });

            doc.save(`export_${isEtabView ? "etablissements" : "professionnels"}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF", error);
        }
    };

    // ── Stat cards dossiers ───────────────────────────────────────────────────
    const dossierCards = [
        { id: "all", label: isInstructor ? "Mes Dossiers" : "Tous", value: filteredProfessionnels.length + (showEtablissements ? filteredEtablissements.length : 0), icon: <Folder className="w-4 h-4" />, color: "blue" },
        { id: "attente", label: "En attente", value: stats.atttente ?? stats.attente ?? 0, icon: <Clock className="w-4 h-4" />, color: "amber" },
        { id: "accepted", label: "Acceptés", value: stats.accepte ?? 0, icon: <CheckCircle2 className="w-4 h-4" />, color: "emerald" },
        { id: "rejected", label: "Rejetés / Refusés", value: (stats.rejete || 0) + (stats.refuse || 0), icon: <XCircle className="w-4 h-4" />, color: "rose" },
        { id: "validated", label: "Validés", value: stats.valide ?? 0, icon: <ShieldCheck className="w-4 h-4" />, color: "indigo" },
        { id: "a_jour", label: "À jour", value: stats.a_jour ?? 0, icon: <TrendingUp className="w-4 h-4" />, color: "green" },
        ...(showEtablissements ? [{ id: "etablissement", label: isInstructor ? "Mes Dossiers" : "Établissements", value: filteredEtablissements.length, icon: <Building2 className="w-4 h-4" />, color: "purple" }] : []),
        { id: "date", label: "Aujourd'hui", value: format(currentTime, "dd MMMM yyyy HH:mm:ss", { locale: fr }), icon: <Clock className="w-4 h-4" />, color: "slate", isDate: true },
    ];

    // ── Stat cards comptable ──────────────────────────────────────────────────
    const comptableCards = [
        { id: "montant", label: "Montant total", value: showAmount ? `${(comptableStats.montantTotal ?? 0).toLocaleString("fr-FR")} FCFA` : "•••••", icon: <Banknote className="w-4 h-4" />, color: "emerald" },
        { id: "c_ok", label: "Transactions réussies", value: comptableStats.nombreSuccess ?? 0, icon: <CheckCircle2 className="w-4 h-4" />, color: "blue" },
        { id: "c_ko", label: "Échouées", value: comptableStats.nombreFail ?? 0, icon: <XCircle className="w-4 h-4" />, color: "rose" },
        { id: "t_ok", label: "Réussies auj.", value: comptableStats.toDayTransactionSuccess ?? 0, icon: <TrendingUp className="w-4 h-4" />, color: "emerald" },
        { id: "t_ko", label: "Échouées auj.", value: comptableStats.toDayTransactionFail ?? 0, icon: <XCircle className="w-4 h-4" />, color: "rose" },
        { id: "all", label: "Tous dossiers", value: filteredProfessionnels.length + filteredEtablissements.length, icon: <Folder className="w-4 h-4" />, color: "blue" },
        { id: "etab_c", label: "Établissements", value: filteredEtablissements.length, icon: <Building2 className="w-4 h-4" />, color: "purple" },
        { id: "date", label: "Aujourd'hui", value: format(currentTime, "dd MMMM yyyy HH:mm:ss", { locale: fr }), icon: <Clock className="w-4 h-4" />, color: "slate", isDate: true },
    ];

    const cards = (mode === "comptable" ? comptableCards : dossierCards)
        .filter(c => !allowedCards || allowedCards.includes(c.id));

    // ── Table headers ─────────────────────────────────────────────────────────
    const tableHeaders = isEtabView
        ? ["#", "Entité / Dénomination", "Email", "Téléphone", "Statut", "Date"]
        : ["#", "Nom & Prénoms", "Contact", "Profession", "Statut", "Date"];

    const COLS = tableHeaders.length;

    return (
        <ClientOnly>
            <div className="space-y-4 pb-10">
                {/* ── Header ── */}
                <PageHeader
                    title={title}
                    description={subtitle}
                    count={filteredItems.length}
                    action={
                        <div className="flex gap-2">
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-bold hover:bg-slate-50 transition-colors"
                                title="Actualiser"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Actualiser</span>
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
                                title="Exporter en CSV"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" /> <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0052CC] text-white rounded-lg text-xs font-semibold hover:bg-[#0041A8] transition-colors shadow-sm"
                                title="Exporter en PDF"
                            >
                                <FileText className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PDF</span>
                            </button>
                        </div>
                    }
                />

                {/* ── Toggle montants (mode comptable) ── */}
                {mode === "comptable" && (
                    <button
                        onClick={() => setShowAmount(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 transition-colors"
                    >
                        {showAmount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showAmount ? "Masquer les montants" : "Afficher les montants"}
                    </button>
                )}

                {/* ── Stat Cards ── */}
                <div className={`grid gap-4 ${cards.length > 6 ? "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-" + cards.length}`}>
                    {cards.map((card: any) => (
                        <StatCard
                            key={card.id}
                            label={card.label}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            active={filter === card.id}
                            onClick={() => !card.isDate && setFilter(card.id)}
                            isDate={card.isDate}
                        />
                    ))}
                </div>

                {/* ── Search & Filters ── */}
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par nom, email..."
                    onRefresh={fetchData}
                    isLoading={loading}
                >
                    <div className="flex gap-2 flex-wrap">
                        {!isEtabView && (
                            <select
                                value={selectedProfession}
                                onChange={e => setSelectedProfession(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                            >
                                <option value="">Toutes les professions</option>
                                {professions.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.libelle}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="accepte">Accepté</option>
                            <option value="rejete">Rejeté</option>
                            <option value="refuse">Refusé</option>
                            <option value="valide">Validé</option>
                            <option value="a_jour">À jour</option>
                            <option value="refuse">Refusé</option>
                            <option value="renouvellement">Renouvelé</option>
                        </select>
                    </div>
                </SearchBar>

                {/* ── Data Table ── */}
                <DataTable
                    title="Liste des dossiers"
                    titleIcon={<Users className="w-4 h-4" />}
                    footer={
                        <div className="px-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredItems.length}
                                itemsPerPage={PER_PAGE}
                                onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            />
                        </div>
                    }
                >
                    <Table>
                        <TableHeaderCustom items={tableHeaders} afficheAction={false} />
                        <TableBody>
                            {loading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : paginatedItems.length === 0 ? (
                                <EmptyState
                                    message="Aucun dossier correspondant à votre recherche"
                                    icon={<FileText className="w-10 h-10" />}
                                    cols={COLS}
                                />
                            ) : (
                                paginatedItems.map((item: any, idx: number) => (
                                    <TableRow
                                        key={item.id ?? idx}
                                        className="hover:bg-slate-50/60 border-b border-slate-100 last:border-0 group"
                                    >
                                        {/* N° */}
                                        <TableCell className="px-4 py-3 text-sm text-slate-800 font-bold w-12">
                                            {(currentPage - 1) * PER_PAGE + idx + 1}
                                        </TableCell>

                                        {/* Nom / Entité */}
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar
                                                    nom={item.personne?.nom ?? item.personne?.denomination}
                                                    prenoms={item.personne?.prenoms}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-slate-800 truncate max-w-[180px]">
                                                        {isEtabView
                                                            ? (item.personne?.denomination ?? "—")
                                                            : `${item.personne?.nom ?? ""} ${item.personne?.prenoms ?? ""}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-800 font-medium truncate">
                                                        {item.login ?? item.email ?? "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Email */}
                                        <TableCell className="px-4 py-3 text-xs text-slate-900 font-medium truncate max-w-[160px]">
                                            {item.email ?? "—"}
                                        </TableCell>

                                        {/* Téléphone / Profession */}
                                        <TableCell className="px-4 py-3 text-sm text-slate-900 font-medium">
                                            {isEtabView
                                                ? (item.personne?.telephone ?? item.personne?.number ?? "—")
                                                : (item.personne?.profession?.libelle ?? item.personne?.typePersonne?.libelle ?? "—")}
                                        </TableCell>

                                        {/* Statut */}
                                        <TableCell className="px-4 py-3">
                                            <StatusPill status={item.personne?.status} />
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="px-4 py-3 text-xs text-slate-800 font-medium">
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString("fr-FR")
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </DataTable>
            </div>
        </ClientOnly>
    );
}
