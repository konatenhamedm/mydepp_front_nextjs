"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { CreditCard, Search, Printer, Filter } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import { PageHeader, SearchBar, DataTable, TableSkeletonRows, EmptyState, TD, PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Show } from "./Show";
import { RecuPaiement } from "./RecuPaiement";

function formatAmount(amount: string | number) {
    const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (isNaN(num)) return amount;
    return num.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(dateString: string) {
    if (!dateString) return "—";
    try { return new Date(dateString).toLocaleDateString("fr-FR"); } catch { return dateString; }
}

const statusColors: any = {
    SUCCESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function HistoriquePaiementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [selectedAmount, setSelectedAmount] = useState<string>("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "print" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        // apiFetch retrieves all transactions
        apiFetch("/paiement/historique/professionnel")
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    // Unique amounts for filter
    const amountOptions = useMemo(() => {
        const amounts = Array.from(new Set(data.map(item => item.montant))).filter(Boolean);
        return amounts.sort((a, b) => parseInt(a as string) - parseInt(b as string));
    }, [data]);

    const filteredData = useMemo(() => {
        let filtered = data;

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.reference?.toLowerCase().includes(q) ||
                item.user?.nom?.toLowerCase().includes(q) ||
                item.user?.prenoms?.toLowerCase().includes(q) ||
                item.email?.toLowerCase().includes(q)
            );
        }

        if (selectedAmount !== "all") {
            filtered = filtered.filter(item => String(item.montant) === selectedAmount);
        }

        if (startDate) {
            filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(item => new Date(item.createdAt) <= new Date(endDate));
        }

        return filtered;
    }, [data, searchTerm, selectedAmount, startDate, endDate]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 11;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Historique des paiements professionnels"
                    description="Suivi des transactions et reçus de paiement"
                    count={filteredData.length}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                        <Filter className="w-4 h-4" /> Filtres
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SearchBar
                            value={searchTerm}
                            onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                            placeholder="Recherche générale..."
                            onRefresh={refreshData}
                            isLoading={isLoading}
                        />

                        <Select value={selectedAmount} onValueChange={(v) => { setSelectedAmount(v); setCurrentPage(1); }}>
                            <SelectTrigger className="bg-slate-50">
                                <SelectValue placeholder="Tous les montants" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les montants</SelectItem>
                                {amountOptions.map(amount => (
                                    <SelectItem key={amount as string} value={String(amount)}>
                                        {formatAmount(amount as string)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            className="bg-slate-50"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                        />
                        <Input
                            type="date"
                            className="bg-slate-50"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <DataTable
                    title="Transactions récentes"
                    titleIcon={<CreditCard className="w-4 h-4" />}
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
                            items={["Nom", "Prénoms", "Profession", "Référence", "Type", "Moyen", "Email", "État", "Montant", "Date"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentItems.length === 0 ? (
                                <EmptyState message="Aucune transaction trouvée" icon={<CreditCard className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentItems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.bold}>{item?.user?.nom || "—"}</td>
                                        <td className={TD.base}>{item?.user?.prenoms || "—"}</td>
                                        <td className={TD.muted}>{item?.user?.profession?.libelle || "—"}</td>
                                        <td className={TD.bold}>{item?.reference}</td>
                                        <td className={TD.muted}>{item?.type}</td>
                                        <td className={TD.base}>{item?.channel || "—"}</td>
                                        <td className={TD.base}>{item?.email || "—"}</td>
                                        <td className={TD.base}>
                                            <Badge className={statusColors[item.state] || "bg-slate-100 text-slate-800"}>
                                                {item.state || "INCONNU"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 border-b border-slate-100 whitespace-nowrap text-right">
                                            {formatAmount(item.montant)}
                                        </td>
                                        <td className={TD.base}>{formatDate(item.createdAt)}</td>

                                        <td className={TD.action}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Voir les détails">
                                                    <Search className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("print", item)} className="p-2 text-slate-400 hover:text-[#0052CC] transition-colors" title="Imprimer le reçu">
                                                    <Printer className="h-4 w-4" />
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
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <RecuPaiement isOpen={modalType === "print"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
