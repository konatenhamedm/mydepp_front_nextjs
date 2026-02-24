"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Coins, Hash } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

export default function DevisePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/paysDevises/all")
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

    const handleCloseModal = () => {
        setModalType(null);
        setSelecteditem(null);
    };

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.symbole?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 4;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Devises"
                    description="Gestion des monnaies et devises"
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvelle devise
                        </PrimaryButton>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par code ou symbole..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des devises"
                    titleIcon={<Coins className="w-4 h-4" />}
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
                            items={["#", "Code", "Symbole", "Décimales"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune devise trouvée" icon={<Coins className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.mono}>{item.code}</td>
                                        <td className={TD.bold}>{item.symbole}</td>
                                        <td className={TD.base}>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <Hash className="w-3 h-3" />
                                                {item.nb_decimal} décimales
                                            </span>
                                        </td>
                                        <td className={TD.action}>
                                            <ActionButtons
                                                onView={() => handleOpenModal("view", item)}
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
