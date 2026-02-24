"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, FileText, Tag, Download, Eye } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    const handleDownload = () => {
        if (data.path) window.open(data.path, "_blank");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Info className="h-5 w-5" /></div>
                    Détails du document
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                        <Download className="w-4 h-4" /> Télécharger
                    </button>
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
                            ID Système
                        </div>
                        <p className="text-slate-500 text-sm">#{data.id}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Fichier attaché</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-[250px] truncate">{data.path ? data.path.split('/').pop() : "Aucun fichier"}</p>
                    </div>
                    {data.path && (
                        <button onClick={handleDownload} className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                            <Eye className="w-4 h-4" /> Prévisualiser / Voir
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
