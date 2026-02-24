"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, User, Mail, Shield, UserCircle } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><User className="h-5 w-5" /></div>
                    Profil Utilisateur Externe
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
                {/* Header Profile */}
                <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-[#0052CC] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#0052CC]/20">
                        {data.personne?.nom?.[0] || data.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{data.personne?.nom} {data.personne?.prenoms}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={data.isActive ? "bg-emerald-500" : "bg-slate-400"}>
                                {data.isActive ? "Compte Actif" : "En attente / Inactif"}
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">ID: #{data.id}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                            <Mail className="w-3 h-3" /> Email de connexion
                        </div>
                        <p className="text-slate-700 font-medium">{data.email}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                            <Shield className="w-3 h-3" /> Type de compte
                        </div>
                        <p className="text-slate-700 font-medium">
                            <Badge variant="outline" className="text-[#0052CC] border-[#0052CC]/20 bg-[#0052CC]/5">
                                {data.typeUser}
                            </Badge>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                            <UserCircle className="w-3 h-3" /> Nom de famille
                        </div>
                        <p className="text-slate-700 font-medium">{data.personne?.nom || '—'}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                            <UserCircle className="w-3 h-3" /> Prénom(s)
                        </div>
                        <p className="text-slate-700 font-medium">{data.personne?.prenoms || '—'}</p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-4">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Cet utilisateur s'est inscrit via le portail public. Il possède des accès restreints selon son rôle <strong>{data.typeUser}</strong>.
                        Toute modification directe de ses informations doit être faite avec prudence.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
