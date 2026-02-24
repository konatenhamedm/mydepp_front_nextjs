"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { ShoppingCart, Store, Filter, Calendar, User, Wallet, UserCheck, Plus, ListFilter, CreditCard, Clock, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD, PrimaryButton,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Show } from "./Show";
import { Delete } from "./Delete";
import { Add } from "./Add";
import { Paiement } from "./Paiement";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";

export default function VentesPage() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    // Filters state
    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
        caisse_id: "",
        vendeur_id: "",
        client_id: ""
    });

    // Dropdown data
    const [caisses, setCaisses] = useState<any[]>([]);
    const [vendeurs, setVendeurs] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | "add" | "paiement" | null>(null);

    const refreshData = (isTodayOnly = false) => {
        if (!magasinId) return;
        setIsLoading(true);

        let endpoint = isTodayOnly
            ? `/ventes/all-of-day/magasin/${magasinId}`
            : `/ventes/all/magasin/${magasinId}`;

        // Build query string
        const params = new URLSearchParams();
        if (!isTodayOnly) {
            if (filters.date_debut) params.append("date_debut", filters.date_debut);
            if (filters.date_fin) params.append("date_fin", filters.date_fin);
            if (filters.caisse_id) params.append("caisse_id", filters.caisse_id);
            if (filters.vendeur_id) params.append("vendeur_id", filters.vendeur_id);
            if (filters.client_id) params.append("client_id", filters.client_id);
        }

        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

        apiFetch(url)
            .then((res) => {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const fetchFiltersData = () => {
        if (!magasinId) return;
        // Fetch caisses
        apiFetch(`/caisses/all/magasin/${magasinId}`).then(res => setCaisses(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        // Fetch personnels (vendeurs)
        apiFetch(`/personnels/all/magasin/${magasinId}`).then(res => setVendeurs(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        // Fetch clients
        apiFetch(`/clients/all/magasin/${magasinId}`).then(res => setClients(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
    };

    useEffect(() => {
        if (magasinId) {
            refreshData();
            fetchFiltersData();
        }
    }, [magasinId]);

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.ref_vente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.client?.nom + " " + item.client?.prenom).toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const COLS = 9;

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

    const getStatusBadge = (item: any) => {
        if (item.montant_regle >= item.montant_ttc) {
            return <Badge className="bg-green-50 text-green-700 border-green-100 font-bold">Payée</Badge>;
        }
        if (item.montant_credit > 0) {
            return <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold">Crédit</Badge>;
        }
        return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold">Non payée</Badge>;
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Ventes"
                    description={`Gestion des transactions — ${magasin?.libelle ?? "Magasin"}`}
                    count={filteredData.length}
                    action={
                        <div className="flex gap-2">
                            <button
                                onClick={() => refreshData(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-sm h-10"
                            >
                                <Clock className="w-4 h-4 text-[#0052cc]" />
                                Ventes du jour
                            </button>
                            <PrimaryButton onClick={() => handleOpenModal("add")} className="h-10">
                                <Plus className="w-4 h-4" />
                                Nouvelle Vente
                            </PrimaryButton>
                        </div>
                    }
                />

                {/* Filters Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-black text-[10px] uppercase tracking-widest border-b border-slate-50 pb-3">
                        <Filter className="w-3.5 h-3.5" /> Filtres Avancés
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Début</Label>
                            <Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Fin</Label>
                            <Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Caisse</Label>
                            <select value={filters.caisse_id} onChange={(e) => setFilters({ ...filters, caisse_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Toutes</option>
                                {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Vendeur</Label>
                            <select value={filters.vendeur_id} onChange={(e) => setFilters({ ...filters, vendeur_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                {vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom} {v.prenoms}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Client</Label>
                            <select value={filters.client_id} onChange={(e) => setFilters({ ...filters, client_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <PrimaryButton onClick={() => refreshData()} className="h-9 px-6 text-xs rounded-xl">
                            Appliquer les filtres
                        </PrimaryButton>
                    </div>
                </div>

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par référence ou nom client..."
                    onRefresh={() => refreshData()}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Historique des ventes"
                    titleIcon={<ShoppingCart className="w-4 h-4" />}
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
                            items={["Référence", "Date", "Client", "Vendeur", "Net à payer", "Réglé", "Solde dû", "Statut"]}
                            afficheAction={true}
                            actionWidth="120px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune transaction trouvée" icon={<ShoppingCart className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.mono}>{item.ref_vente}</td>
                                        <td className={TD.base}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{fmtDate(item.date_vente)}</span>
                                                <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">VTE-{item.id}</span>
                                            </div>
                                        </td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                                                    {item.client?.nom?.substring(0, 2) || "AN"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{item.client ? `${item.client.nom} ${item.client.prenom}` : "Client Anonyme"}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{item.client?.telephone || "—"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className="text-[11px] font-bold text-slate-500 uppercase">{item.user_vendeur?.nom}</span>
                                        </td>
                                        <td className={TD.mono}>
                                            <span className="text-slate-900 font-black">{fmt(item.montant_ttc)}</span>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-green-600 font-mono">{fmt(item.montant_regle)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{item.mode_paiement?.libelle || "Multiple"}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <span className={`text-sm font-black font-mono ${item.montant_credit > 0 ? "text-red-500" : "text-slate-300"}`}>
                                                {fmt(item.montant_credit)}
                                            </span>
                                        </td>
                                        <td className={TD.base}>
                                            {getStatusBadge(item)}
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleOpenModal("view", item)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                {item.montant_credit > 0 && (
                                                    <button onClick={() => handleOpenModal("paiement", item)} title="Régler le crédit" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                                                        <Wallet className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpenModal("delete", item)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
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

                {modalType === "add" && <Add isOpen={true} onClose={handleCloseModal} onSuccess={() => refreshData()} />}

                {selecteditem && (
                    <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Paiement isOpen={modalType === "paiement"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
