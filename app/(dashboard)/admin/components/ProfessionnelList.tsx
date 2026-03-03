"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Mail, Phone, Eye, Users } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState
} from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShowDetails } from "@/app/(dashboard)/admin/professionnel/ShowDetails";
import { Imputation } from "@/app/(dashboard)/admin/professionnel/Imputation";
import { useSession } from "next-auth/react";

const TABS = [
    { key: "attente", label: "En attente" },
    { key: "accepte", label: "Accepté" },
    { key: "rejete", label: "Rejeté" },
    { key: "valide", label: "Validé" },
    { key: "refuse", label: "Refusé" },
    { key: "renouvellement", label: "Renouvellement" },
    { key: "a_jour", label: "À jour" },
    { key: "refuse_mise_a_jour", label: "Attente de MàJ" },
];

interface ProfessionnelListProps {
    /** Titre de la page */
    title: string;
    description?: string;
    /**
     * API endpoint - ex: "/professionnel/" ou "/professionnel/by/instructeur/"
     * Si non fourni: utilise /professionnel/ par défaut
     */
    apiPath?: string;
    /** Afficher le bouton imputation (onglet "attente") */
    showImputation?: boolean;
    /** Afficher le bouton voir détails */
    showView?: boolean;
}

export default function ProfessionnelList({
    title,
    description = "Suivi et gestion des dossiers professionnels",
    apiPath = "/professionnel/",
    showImputation = false,
    showView = true,
}: ProfessionnelListProps) {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const itemsPerPage = 10;

    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "imputation" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch(apiPath)
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelectedItem(item);
    };
    const handleCloseModal = () => { setModalType(null); setSelectedItem(null); };

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        TABS.forEach(t => {
            counts[t.key] = data.filter(i => (i.personne?.status ?? i.status) === t.key).length;
        });
        return counts;
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const status = item.personne?.status ?? item.status;
            if (status !== activeTab) return false;
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return (
                item.personne?.nom?.toLowerCase().includes(q) ||
                item.personne?.prenoms?.toLowerCase().includes(q) ||
                item.personne?.number?.toLowerCase().includes(q) ||
                item.email?.toLowerCase().includes(q) ||
                item.code?.toLowerCase().includes(q)
            );
        });
    }, [data, activeTab, searchTerm]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

    const COLS = showView ? 6 : 5;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title={title}
                    description={description}
                    count={data.length}
                />

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-slate-100 p-2 overflow-x-auto">
                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full min-w-max">
                            <TabsList className="bg-transparent h-auto flex gap-1 p-1">
                                {TABS.map(tab => (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-[#0052CC] data-[state=active]:text-white data-[state=inactive]:text-slate-800 data-[state=inactive]:hover:bg-slate-50"
                                    >
                                        {tab.label}
                                        <Badge className={`ml-2 border-none shadow-none font-bold ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-900"}`}>
                                            {tabCounts[tab.key] || 0}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-slate-100">
                        <SearchBar
                            value={searchTerm}
                            onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                            placeholder="Rechercher par nom, email, téléphone..."
                            onRefresh={refreshData}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Table */}
                    <DataTable
                        title="Dossiers Professionnels"
                        titleIcon={<Users className="w-4 h-4" />}
                        footer={
                            <div className="p-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={filteredData.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                />
                            </div>
                        }
                    >
                        <table className="w-full">
                            <TableHeaderCustom
                                items={["#", "Nom complet", "Contact", "Profession", "Imputation"]}
                                afficheAction={showView}
                                actionWidth="90px"
                            />
                            <tbody>
                                {isLoading ? (
                                    <TableSkeletonRows cols={COLS} />
                                ) : currentItems.length === 0 ? (
                                    <EmptyState message="Aucun professionnel trouvé" icon={<Users className="w-10 h-10" />} cols={COLS} />
                                ) : (
                                    currentItems.map((item, index) => (
                                        <tr key={item.id ?? index} className="hover:bg-slate-50/50 transition-colors duration-100 border-b border-slate-50 last:border-0 group">
                                            <td className="px-4 py-3 text-sm text-slate-900 font-black">{startIndex + index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-sm text-slate-950">
                                                        {item.personne?.nom} {item.personne?.prenoms}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-slate-900 font-black tracking-wider">
                                                        {item.personne?.code || item.code || "SANS CODE"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    {item.email && (
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                                                            <Mail className="w-3 h-3 text-slate-900" /> {item.email}
                                                        </span>
                                                    )}
                                                    {item.personne?.number && (
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                                                            <Phone className="w-3 h-3 text-slate-900" /> {item.personne.number}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900 font-bold">
                                                {item.personne?.profession?.libelle || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.personne?.imputationData ? (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none text-xs">
                                                        {item.personne.imputationData.nom} {item.personne.imputationData.prenoms}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-800 text-xs font-black italic">Non assigné</span>
                                                )}
                                            </td>
                                            {showView && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal("view", item)}
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#EBF2FF] text-[#0052CC] hover:bg-[#0052CC] hover:text-white transition-all"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        {showImputation && activeTab === "attente" && (
                                                            <button
                                                                onClick={() => handleOpenModal("imputation", item)}
                                                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                                                                title="Imputation"
                                                            >
                                                                <Users className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </DataTable>
                </div>

                {/* Modals */}
                {selectedItem && (
                    <>
                        <ShowDetails isOpen={modalType === "view"} onClose={handleCloseModal} data={selectedItem} />
                        <Imputation isOpen={modalType === "imputation"} onClose={handleCloseModal} data={selectedItem} onSuccess={refreshData} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
