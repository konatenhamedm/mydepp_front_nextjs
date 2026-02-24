"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, UserCog, Mail, Shield, CheckCircle, XCircle, Calendar, Hash } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";

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
                    Profil de l'administrateur
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
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                        <UserCog className="w-10 h-10" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h2 className="text-2xl font-bold text-slate-900">{data.personne?.nom} {data.personne?.prenoms}</h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
                                <Shield className="w-3 h-3 mr-1" /> {data.typeUser}
                            </Badge>
                            {data.isActive ? (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Actif
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200">
                                    <XCircle className="w-3 h-3 mr-1" /> Inactif
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Mail className="w-3 h-3" /> Adresse Email
                        </div>
                        <p className="text-slate-900 font-semibold">{data.email}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Hash className="w-3 h-3" /> Identifiant Système
                        </div>
                        <p className="text-slate-900 font-semibold">#{data.id}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Calendar className="w-3 h-3" /> Date de création
                        </div>
                        <p className="text-slate-900 font-semibold">{data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            Rôle Principal
                        </div>
                        <p className="text-slate-900 font-semibold">{data.typeUser || "Utilisateur"}</p>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <p className="text-xs text-blue-700">
                        Cet utilisateur dispose de privilèges d'administration. Toutes ses actions sont enregistrées dans les journaux d'audit du système.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
