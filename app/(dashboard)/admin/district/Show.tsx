"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, Navigation, Tag, Map } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Info className="h-5 w-5" /></div>
                    Détails du district
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full">
                    <PrimaryButton onClick={onClose} className="px-6">Fermer</PrimaryButton>
                </div>
            }
        >
            <div className="py-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Tag className="w-3 h-3" /> Libellé
                        </div>
                        <p className="text-slate-900 font-semibold text-lg">{data.libelle}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Map className="w-3 h-3" /> Région
                        </div>
                        <p className="text-slate-900 font-semibold text-lg">{data.region_libelle || data.region?.libelle || "N/A"}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            ID Système
                        </div>
                        <p className="text-slate-500 text-sm">#{data.id}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-slate-300" />
                    <p className="text-xs text-slate-500">
                        Ce district est une subdivision de la région {data.region_libelle || data.region?.libelle}.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
