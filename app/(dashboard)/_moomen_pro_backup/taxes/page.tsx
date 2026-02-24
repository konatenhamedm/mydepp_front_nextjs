"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, DollarSign, Store } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";

export default function Page() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/taxes/all/magasin/{id}`.replace("{id}", String(magasinId)))
            .then((res) => { setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setIsLoading(false); })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter((item) => searchTerm === "" || item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, [magasinId]);

    const COLS = 4;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <Store className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">Veuillez sélectionner un magasin dans la barre latérale</p>
                </div>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Taxes"
                    description={`Taxes du magasin ${magasin?.libelle ?? ""}`}
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvelle taxe
                        </PrimaryButton>
                    }
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par libellé..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Liste taxes"
                    titleIcon={<DollarSign className="w-4 h-4" />}
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
                        <TableHeaderCustom items={["#", "Libellé", "Taux (%)"]} afficheAction={true} actionWidth="100px" />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune taxe trouvée" icon={<DollarSign className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.bold}>{item.libelle}</td>
                                        <td className={TD.mono}>
                                            <span className="font-bold text-slate-700">{item.valeur}%</span>
                                        </td>

                                        <td className={TD.action}>
                                            <ActionButtons
                                                onEdit={() => handleOpenModal("edit", item)}
                                                onDelete={() => handleOpenModal("delete", item)}
                                            />
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
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
