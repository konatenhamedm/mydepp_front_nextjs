"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, UserCog, Mail, Shield, CheckCircle, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function AdministrateurPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/user/get/admin")
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.personne?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.personne?.prenoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.typeUser?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Administrateurs"
                    description="Gestion des accès administratifs du système"
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvel administrateur
                        </PrimaryButton>
                    }
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, email ou type..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Liste des administrateurs"
                    titleIcon={<UserCog className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setSearchTerm(searchTerm); setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Nom et prénoms", "Email", "Type de compte", "Statut"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun administrateur trouvé" icon={<UserCog className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.bold}>
                                            <div className="flex flex-col">
                                                <span>{item.personne?.nom} {item.personne?.prenoms}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">#{item.id}</span>
                                            </div>
                                        </td>
                                        <td className={TD.muted}>
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                {item.email}
                                            </div>
                                        </td>
                                        <td className={TD.muted}>
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="w-3 h-3 text-indigo-400" />
                                                {item.typeUser}
                                            </div>
                                        </td>
                                        <td className={TD.muted}>
                                            {item.isActive ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Actif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
                                                    <XCircle className="w-3 h-3" /> Inactif
                                                </Badge>
                                            )}
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
