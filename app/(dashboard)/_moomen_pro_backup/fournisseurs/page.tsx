"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Truck, Store, MapPin, Phone, Mail, Eye, Edit3, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

export default function FournisseursPage() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 8;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/fournisseurs/all/magasin/${magasinId}`)
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

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tel?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, [magasinId]);

    const COLS = 5;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-800 font-black text-lg uppercase tracking-tight">Aucun Magasin Sélectionné</p>
                        <p className="text-slate-400 text-sm font-medium">Veuillez choisir un établissement pour gérer vos fournisseurs</p>
                    </div>
                </div>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Partenaires & Fournisseurs"
                    description={`Réseau d'approvisionnement de ${magasin?.libelle || "votre magasin"}`}
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouveau partenaire
                        </PrimaryButton>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par enseigne, ville, téléphone..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des Fournisseurs"
                    titleIcon={<Truck className="w-4 h-4" />}
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
                            items={["Fournisseur / Enseigne", "Contact Pro", "Localisation"]}
                            afficheAction={true}
                            actionWidth="160px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun partenaire trouvé" icon={<Truck className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-50 last:border-0">
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {item.nom?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 tracking-tight">{item.nom}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <Truck className="w-2.5 h-2.5" /> ID #{item.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-[#0052cc]" /> {item.tel || "—"}
                                                </span>
                                                {item.email && (
                                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3" /> {item.email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={TD.muted}>
                                            <div className="flex items-center gap-2 max-w-[250px]">
                                                <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span className="truncate text-[11px] font-black uppercase tracking-wider">{item.adresse || "Siège non défini"}</span>
                                            </div>
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 rounded-xl bg-[#0052cc]/5 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("edit", item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("delete", item)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm">
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="lg" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="lg" />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="lg" />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
