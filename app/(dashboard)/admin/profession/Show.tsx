"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, Briefcase, Tag, Clock, CreditCard, Layers } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "lg" }: Props) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Info className="h-5 w-5" /></div>
                    Détails de la profession
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full">
                    <PrimaryButton onClick={onClose} className="px-6">Fermer</PrimaryButton>
                </div>
            }
        >
            <div className="py-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Tag className="w-3 h-3" /> Libellé
                        </div>
                        <p className="text-slate-900 font-semibold text-lg">{data.libelle}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Code
                        </div>
                        <p className="text-slate-900 font-semibold text-lg">{data.code}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Layers className="w-3 h-3" /> Type de profession
                        </div>
                        <p className="text-slate-900 font-medium">{data.typeProfession?.libelle || "N/A"}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Code Génération
                        </div>
                        <p className="text-slate-900 font-medium">{data.codeGeneration || "N/A"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                            <CreditCard className="w-4 h-4" /> Nouv. Demande
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.montantNouvelleDemande} <span className="text-sm font-normal text-slate-500">FCFA</span></p>
                    </div>

                    <div className="space-y-2 border-l border-slate-200 pl-6">
                        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                            <CreditCard className="w-4 h-4" /> Renouvellement
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.montantRenouvellement} <span className="text-sm font-normal text-slate-500">FCFA</span></p>
                    </div>

                    <div className="space-y-2 border-l border-slate-200 pl-6">
                        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-4 h-4" /> Chrono Max
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.chronoMax} <span className="text-sm font-normal text-slate-500">jours</span></p>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <p className="text-xs text-blue-700">
                        Cette configuration définit les paramètres financiers et temporels pour les dossiers liés à cette profession.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
