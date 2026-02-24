"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Users, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { Badge } from "@/components/ui/badge";

export default function UtilisateurExternePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/user/get/user/externe")
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
            item.typeUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.personne?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.personne?.prenoms?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    title="Utilisateurs Externes"
                    description="Gestion des utilisateurs inscrits depuis le portail"
                    count={filteredData.length}
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, email ou type..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Liste des utilisateurs externes"
                    titleIcon={<Users className="w-4 h-4" />}
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
                            items={["#", "Utilisateur", "Email", "Type", "Statut"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun utilisateur trouvé" icon={<Users className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {item.personne?.nom?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">{item.personne?.nom} {item.personne?.prenoms}</div>
                                                    <div className="text-[10px] text-slate-400">ID: #{item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.base}>{item.email}</td>
                                        <td className={TD.base}>
                                            <Badge variant="outline" className="bg-slate-50">{item.typeUser}</Badge>
                                        </td>
                                        <td className={TD.base}>
                                            {item.isActive ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Actif</Badge>
                                            ) : (
                                                <Badge className="bg-red-50 text-red-600 border-red-100">Inactif</Badge>
                                            )}
                                        </td>

                                        <td className={TD.action}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal("view", item)} className="text-slate-400 hover:text-[#0052CC] p-1.5 hover:bg-[#0052CC]/5 rounded-lg transition-colors">
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("delete", item)} className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                    <ShieldAlert className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {selecteditem && (
                    <>
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
