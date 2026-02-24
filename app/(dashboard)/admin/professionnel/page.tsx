"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Search, Phone, Mail, UserPlus, Eye, Users } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD
} from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";

import { ShowDetails } from "./ShowDetails";
import { Imputation } from "./Imputation";

// {key: 'attente', label: 'En attente'},
// {key: 'accepte', label: 'Accepté'},
// {key: 'rejete', label: 'Rejeté'},
// {key: 'valide', label: 'Validé'},
// {key: 'refuse', label: 'Refusé'},
// {key: 'renouvellement', label: 'Renouvellement'},
// {key: 'a_jour', label: 'À jour'},
// { key: "refuse_mise_a_jour", label: "Attente de Mise à jour" },
const TABS = [
    { key: 'attente', label: 'En attente' },
    { key: 'accepte', label: 'Accepté' },
    { key: 'rejete', label: 'Rejeté' },
    { key: 'valide', label: 'Validé' },
    { key: 'refuse', label: 'Refusé' },
    { key: 'renouvellement', label: 'Renouvellement' },
    { key: 'a_jour', label: 'À jour' },
    { key: 'refuse_mise_a_jour', label: 'Attente de MàJ' },
];

export default function ProfessionnelPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.roleLibelle || "";

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "imputation" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/professionnel/")
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
        TABS.forEach(t => counts[t.key] = data.filter(i => i.status === t.key).length);
        return counts;
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesTab = item.status === activeTab;
            if (!matchesTab) return false;
            if (searchTerm === "") return true;

            const q = searchTerm.toLowerCase();
            return (
                item.nom?.toLowerCase().includes(q) ||
                item.prenoms?.toLowerCase().includes(q) ||
                item.number?.toLowerCase().includes(q) ||
                item.emailUser?.toLowerCase().includes(q) ||
                item.code?.toLowerCase().includes(q)
            );
        });
    }, [data, activeTab, searchTerm]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const showActions = ['SOUS-DIRECTEUR-ETAB', 'SOUS-DIRECTEUR-PROF', 'DIRECTEUR', 'INSTRUCTEUR-ETAB', 'INSTRUCTEUR-SECOND-ETAB', 'INSTRUCTEUR'].includes(userRole);
    // Actually Imputation could be open to more. Let's just say true if any action allowed.

    const COLS = 6;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Professionnels"
                    description="Suivi et gestion des dossiers professionnels"
                    count={data.length}
                />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="border-b border-slate-100 p-2 overflow-x-auto">
                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full min-w-max">
                            <TabsList className="bg-transparent h-auto flex gap-1 p-1">
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
                            placeholder="Rechercher par nom, email, téléphone..."
                            onRefresh={refreshData}
                            isLoading={isLoading}
                        />
                    </div>

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
                                afficheAction={showActions}
                                actionWidth="120px"
                            />
                            <tbody>
                                {isLoading ? (
                                    <TableSkeletonRows cols={COLS} />
                                ) : currentitems.length === 0 ? (
                                    <EmptyState message="Aucun professionnel trouvé" icon={<Users className="w-10 h-10" />} cols={COLS} />
                                ) : (
                                    currentitems.map((item, index) => {
                                        return (
                                            <tr key={item.id ?? index} className="hover:bg-slate-50/50 transition-colors duration-100 border-b border-slate-50 last:border-0 group">
                                                <td className="px-4 py-3 text-sm text-slate-500">{startIndex + index + 1}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-sm text-slate-800">
                                                            {item.nom} {item.prenoms}
                                                        </span>
                                                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                                                            {item.code || 'SANS CODE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        {item.emailUser && (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                <Mail className="w-3.5 h-3.5 text-slate-400" /> {item.emailUser}
                                                            </span>
                                                        )}
                                                        {item.number && (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {item.number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    {item.profession?.libelle || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    {item.imputationData ? (
                                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none">
                                                            {item.imputationData.username}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs italic">Non assigné</span>
                                                    )}
                                                </td>

                                                {showActions && (
                                                    <td className="px-4 py-3 text-sm align-middle text-right">
                                                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenModal("view", item)}
                                                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                                                title="Voir les détails complets"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            {activeTab === 'attente' && (
                                                                <button
                                                                    onClick={() => handleOpenModal("imputation", item)}
                                                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors flex items-center"
                                                                    title="Gérer l'imputation"
                                                                >
                                                                    <UserPlus className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </DataTable>
                </div>

                {selecteditem && (
                    <>
                        <ShowDetails isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <Imputation isOpen={modalType === "imputation"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
