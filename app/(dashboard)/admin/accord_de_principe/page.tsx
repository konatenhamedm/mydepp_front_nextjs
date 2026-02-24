"use client";

import React, { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/axios";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD
} from "@/components/ui/page-components";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, UserCheck, RefreshCcw, Building2, Mail, Phone } from "lucide-react";
import { ShowDetails } from "./ShowDetails";
import { Imputation } from "./Imputation";
import { ClientOnly } from "@/components/ui/client-only";

const TABS = [
    { key: "acp_attente_dossier_depot_service_courrier", label: "Attente dépôt" },
    { key: "acp_dossier_attente_validation_directrice", label: "Attente validation" },
    { key: "acp_dossier_valide_directrice", label: "Validés" },
];

export default function AccordDePrincipePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalType, setModalType] = useState<"details" | "imputation" | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/etablissement/");
            if (res?.data) {
                setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            if (item.personne?.status !== activeTab) return false;
            if (searchTerm === "") return true;

            const q = searchTerm.toLowerCase();
            const p = item.personne || {};
            return (
                p.denomination?.toLowerCase().includes(q) ||
                p.nomRepresentant?.toLowerCase().includes(q) ||
                p.telephone?.toLowerCase().includes(q) ||
                item.email?.toLowerCase().includes(q) ||
                p.code?.toLowerCase().includes(q)
            );
        });
    }, [data, activeTab, searchTerm]);

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        TABS.forEach(t => counts[t.key] = data.filter(i => i.personne?.status === t.key).length);
        return counts;
    }, [data]);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="p-6 space-y-6">
                <PageHeader
                    title="Accord de Principe (ACP)"
                    description="Gestion et suivi des demandes d'accord de principe pour les établissements."
                    count={data.length}
                />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="border-b border-slate-100 p-2 overflow-x-auto">
                        <div className="flex gap-1 p-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold切换 transition-all flex items-center gap-2 ${activeTab === tab.key
                                            ? 'bg-[#0052CC] text-white'
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.label}
                                    <Badge className={`border-none shadow-none px-1.5 ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {tabCounts[tab.key] || 0}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-100">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Rechercher un dossier ACP..."
                            onRefresh={fetchData}
                            isLoading={loading}
                        />
                    </div>

                    <DataTable
                        title="Dossiers ACP"
                        titleIcon={<Building2 className="w-4 h-4" />}
                    >
                        <table className="w-full">
                            <TableHeaderCustom
                                items={["#", "Dénomination / Représentant", "Email / Contact", "Imputation"]}
                                afficheAction={true}
                                actionWidth="100px"
                            />
                            <tbody>
                                {loading ? (
                                    <TableSkeletonRows cols={COLS} />
                                ) : filteredData.length === 0 ? (
                                    <EmptyState message="Aucun dossier trouvé" icon={<Building2 className="w-10 h-10" />} cols={COLS} />
                                ) : (
                                    filteredData.map((item, index) => {
                                        const p = item.personne || {};
                                        return (
                                            <tr key={item.id ?? index} className="hover:bg-slate-50/50 transition-colors duration-100 border-b border-slate-50 last:border-0 group">
                                                <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-sm text-slate-800">
                                                            {p.denomination || p.nomRepresentant || '—'}
                                                        </span>
                                                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                                                            {p.typeEtablissement?.libelle || 'ACP'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Mail className="w-3 h-3 text-slate-400" /> {item.email || '—'}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Phone className="w-3 h-3 text-slate-300" /> {p.telephone || p.adresse || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                                                    {p.imputationData ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none">
                                                            {p.imputationData.username}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs italic">Non assigné</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm align-middle text-right">
                                                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50"
                                                            onClick={() => { setSelectedItem(item); setModalType("details"); }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                            onClick={() => { setSelectedItem(item); setModalType("imputation"); }}
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </DataTable>
                </div>

                {selectedItem && (
                    <>
                        <ShowDetails
                            isOpen={modalType === "details"}
                            onClose={() => setModalType(null)}
                            data={selectedItem}
                        />
                        <Imputation
                            isOpen={modalType === "imputation"}
                            onClose={() => setModalType(null)}
                            data={selectedItem}
                            onSuccess={fetchData}
                        />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
