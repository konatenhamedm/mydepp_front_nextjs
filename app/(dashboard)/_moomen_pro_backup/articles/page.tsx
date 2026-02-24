"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Package, Store, Zap, ShoppingCart, PackageOpen } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

const TypeBadge = ({ type }: { type: string }) => {
    if (type === "manufacturable") {
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200 gap-1 font-bold"><Zap className="w-3 h-3" /> Fabriqué</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-200">Standard</Badge>;
};

const DetailBadge = ({ active }: { active: boolean | number }) => {
    if (active) return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold">Vente Détail</Badge>;
    return null;
};

export default function Page() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/articles/all/magasin/{id}`.replace("{id}", String(magasinId)))
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
            item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code_barre?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, [magasinId]);

    const COLS = 8;

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
                    title="Articles"
                    description={`Gestion de l'inventaire des articles — ${magasin?.libelle ?? ""}`}
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvel article
                        </PrimaryButton>
                    }
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par libellé ou code barre..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Liste des articles"
                    titleIcon={<Package className="w-4 h-4" />}
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
                            items={["#", "Type/Vente", "Désignation", "Stock", "P. Vente", "Catégorie", "Unité"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun article trouvé" icon={<PackageOpen className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col gap-1.5">
                                                <TypeBadge type={item.product_type} />
                                                <DetailBadge active={item.vente_en_detail} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                                                {item.code_barre && <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{item.code_barre}</span>}
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.stock <= (item.seuil || 0) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                {item.stock ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD.mono}>
                                            <span className="font-bold text-[#0052cc]">
                                                {item.prix_vente?.toLocaleString("fr-FR")} <span className="text-[10px] opacity-70">FCFA</span>
                                            </span>
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-xs text-slate-600 font-medium">{item.categorie?.libelle ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">
                                                {item.unite?.abr ?? item.unite?.libelle ?? "—"}
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="xl" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="xl" />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="xl" />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
