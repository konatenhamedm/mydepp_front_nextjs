"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Wallet, Store, Search, Trash2, Edit3, Eye, HandCoins, History, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";

// Sub-components (to be created next)
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Approvisionner } from "./Approvisionner";
import { Mouvements } from "./Mouvements";

const fmt = (v?: number) => v !== undefined ? v.toLocaleString("fr-FR") : "0";

export default function CaissesPage() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "appro" | "history" | null>(null);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/caisses/all/magasin/${magasinId}`)
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    useEffect(() => { refreshData(); }, [magasinId]);

    const filteredData = Array.isArray(data)
        ? data.filter((item) => searchTerm === "" || item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const COLS = 4;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-800 font-black text-lg uppercase tracking-tight">Aucun Magasin Sélectionné</p>
                        <p className="text-slate-400 text-sm font-medium">Veuillez choisir un établissement pour voir les caisses</p>
                    </div>
                </div>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <div className="space-y-6 font-sans">
                <PageHeader
                    title="Trésorerie & Caisses"
                    description={`Gestion des flux monétaires de ${magasin?.libelle || "votre magasin"}`}
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvelle caisse
                        </PrimaryButton>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl lg:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052cc]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Total Trésorerie</p>
                        <h3 className="text-3xl font-black tracking-tighter">
                            {fmt(data.reduce((acc, curr) => acc + (curr.solde || 0), 0))} <span className="text-xs font-serif italic text-white/30">XOF</span>
                        </h3>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Flux Entrants (Mois)</p>
                            <p className="text-xl font-black text-slate-800 tracking-tight">Développement...</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Flux Sortants (Mois)</p>
                            <p className="text-xl font-black text-slate-800 tracking-tight">Développement...</p>
                        </div>
                    </div>
                </div>

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer les caisses par libellé..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des Caisses"
                    titleIcon={<Wallet className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Libellé de la caisse", "Solde actuel", "Dernière MAJ"]}
                            afficheAction={true}
                            actionWidth="220px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune caisse enregistrée" icon={<Wallet className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-50 last:border-0">
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 tracking-tight">{item.libelle}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID #{item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <Badge className="bg-[#0052cc]/5 text-[#0052cc] border-[#0052cc]/10 font-black px-3 py-1 text-[12px] tracking-tight">
                                                {fmt(item.solde)} XOF
                                            </Badge>
                                        </td>
                                        <td className={TD.muted}>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {item.updated_at ? new Date(item.updated_at).toLocaleDateString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "—"}
                                            </span>
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                <button onClick={() => handleOpenModal("appro", item)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Approvisionner">
                                                    <HandCoins className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("history", item)} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Historique">
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("edit", item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white transition-all shadow-sm" title="Modifier">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("delete", item)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Supprimer">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="md" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                        <Approvisionner isOpen={modalType === "appro"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="lg" />
                        <Mouvements isOpen={modalType === "history"} onClose={handleCloseModal} data={selecteditem} size="2xl" />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
