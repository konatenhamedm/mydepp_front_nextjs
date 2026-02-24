"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { FileCode } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import { PageHeader, SearchBar, DataTable, TableSkeletonRows, EmptyState, TD } from "@/components/ui/page-components";

function fmt(d?: string) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return d; }
}

export default function CodeGenerateurPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/codeGenerateur/")
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.civilite?.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.profession?.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 6;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Code Générateur"
                    description="Historique des codes de certification générés"
                    count={filteredData.length}
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par code, civilité ou profession..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Codes générés"
                    titleIcon={<FileCode className="w-4 h-4" />}
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
                            items={["#", "Date création", "Code", "Civilité", "Profession", "Date naissance"]}
                            afficheAction={false}
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentItems.length === 0 ? (
                                <EmptyState message="Aucun code trouvé" icon={<FileCode className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentItems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.base}>{fmt(item.dateCreation)}</td>
                                        <td className={TD.bold}>{item.code}</td>
                                        <td className={TD.base}>{item.civilite?.libelle || "—"}</td>
                                        <td className={TD.base}>{item.profession?.libelle || "—"}</td>
                                        <td className={TD.base}>{fmt(item.dateNaissance)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>
            </div>
        </ClientOnly>
    );
}
