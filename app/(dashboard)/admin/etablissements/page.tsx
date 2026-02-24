"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Building2, Search, Filter, Hash, Mail, Phone, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Show } from "./Show";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
    { key: 'acp_attente_dossier_depot_service_courrier', label: 'Dossier dépôt' },
    { key: 'acp_dossier_attente_validation_directrice', label: 'Validation directrice' },
    { key: 'acp_dossier_valide_directrice', label: 'Validé par la directrice' },
    { key: 'oep_demande_initie', label: 'Initié' },
    { key: 'oep_dossier_imputer', label: 'Dossier imputer' },
    { key: 'oep_dossier_imputer_conforme_attente_planification_visite', label: 'En attente visite' },
    { key: 'oep_dossier_imputer_non_conforme', label: 'Non conforme' },
    { key: 'oep_dossier_visite_programme', label: 'Visite programmé' },
    { key: 'oep_visite_effectue_attente_validation_directrice', label: 'Visite effectuée' },
    { key: 'oep_dossier_valide', label: 'Validé' },
    { key: 'oep_dossier_rejette', label: 'Rejeté' },
];

export default function EtablissementsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/etablissement/")
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        TABS.forEach(t => counts[t.key] = data.filter(i => i.personne?.status === t.key).length);
        return counts;
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesTab = item.personne?.status === activeTab;
            if (!matchesTab) return false;
            if (searchTerm === "") return true;

            const q = searchTerm.toLowerCase();
            const p = item.personne || {};
            return (
                p.denomination?.toLowerCase().includes(q) ||
                p.nomRepresentant?.toLowerCase().includes(q) ||
                p.telephone?.toLowerCase().includes(q) ||
                item.email?.toLowerCase().includes(q) ||
                p.imputationData?.username?.toLowerCase().includes(q)
            );
        });
    }, [data, activeTab, searchTerm]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Tous les Établissements"
                    description="Vue d'ensemble et suivi de tous les dossiers d'établissements"
                    count={data.length}
                />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="border-b border-slate-100 p-2">
                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full">
                            <TabsList className="bg-transparent h-auto flex flex-wrap gap-1 p-1">
                                {TABS.map(tab => (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-[#0052CC] data-[state=active]:text-white data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-50"
                                    >
                                        {tab.label}
                                        <Badge className={`ml-2 border-none shadow-none ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {tabCounts[tab.key] || 0}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="p-4 border-b border-slate-100">
                        <SearchBar
                            value={searchTerm}
                            onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                            placeholder="Rechercher par dénomination, représentant, email..."
                            onRefresh={refreshData}
                            isLoading={isLoading}
                        />
                    </div>

                    <DataTable
                        title="Dossiers Établissements"
                        titleIcon={<Building2 className="w-4 h-4" />}
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
                                items={["#", "Établissement / Nature", "Contacts", "Imputation", "Statut"]}
                                afficheAction={true}
                                actionWidth="80px"
                            />
                            <tbody>
                                {isLoading ? (
                                    <TableSkeletonRows cols={COLS + 1} />
                                ) : currentitems.length === 0 ? (
                                    <EmptyState message="Aucun établissement trouvé dans cet onglet" icon={<Building2 className="w-10 h-10" />} cols={COLS + 1} />
                                ) : (
                                    currentitems.map((item, index) => (
                                        <tr key={item.id ?? index} className="hover:bg-slate-50/50 transition-colors duration-100 group border-b border-slate-50 last:border-0">
                                            <td className={TD.muted}>{startIndex + index + 1}</td>
                                            <td className={TD.bold}>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">
                                                        {item.personne?.denomination || item.personne?.nomRepresentant || '—'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {item.personne?.typePersonne?.libelle || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={TD.base}>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Phone className="w-3 h-3 text-slate-400" /> {item.personne?.telephone || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Mail className="w-3 h-3 text-slate-400" /> {item.personne?.emailAutre || item.email || '—'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TD.base}>
                                                {item.personne?.imputationData ? (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg flex items-center w-fit gap-2">
                                                        <UserIcon className="w-3 h-3" /> {item.personne?.imputationData.username}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-300 text-xs italic">Non imputé</span>
                                                )}
                                            </td>
                                            <td className={TD.base}>
                                                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-medium lowercase">
                                                    {item.personne?.status?.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>

                                            <td className={TD.action}>
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 hover:bg-[#0052CC]/5 text-slate-400 hover:text-[#0052CC] rounded-xl transition-all">
                                                    <Search className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </DataTable>
                </div>

                {selecteditem && (
                    <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                )}
            </div>
        </ClientOnly>
    );
}
