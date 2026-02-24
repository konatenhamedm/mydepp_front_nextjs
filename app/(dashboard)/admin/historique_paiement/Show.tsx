"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, CreditCard, Calendar, User, Mail, Tag, Navigation, Phone, ShieldCheck } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "lg" }: Props) {
    if (!data) return null;

    const user = data.user || {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><CreditCard className="h-5 w-5" /></div>
                    Détails de la transaction
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
                {/* Header Section */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dossier n° {data.reference}</h2>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium text-sm">
                            <Calendar className="w-4 h-4" /> {new Date(data.createdAt).toLocaleDateString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-[#0052CC] font-mono tracking-tight">
                            {Number(data.montant).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                        </div>
                        <Badge variant="outline" className={`mt-2 ${data.state === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                data.state === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {data.state}
                        </Badge>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                    {/* Colonne 1: Infos sur le paiement */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <CreditCard className="w-4 h-4" /> Détails du paiement
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Type de paiement" value={data.type} />
                            <InfoRow label="Moyen de paiement" value={data.channel || 'Non renseigné'} />
                            <InfoRow label="Référence Gateway" value={data.gatewayTxnId || '—'} />
                            <InfoRow label="Email associé" value={data.email || '—'} />
                        </div>
                    </div>

                    {/* Colonne 2: Infos sur l'utilisateur */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User className="w-4 h-4" /> Informations Payeur
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Nom & Prénoms" value={`${user.nom || ''} ${user.prenoms || ''}`.trim() || '—'} />
                            <InfoRow label="Profession" value={user.profession?.libelle || '—'} />
                            <InfoRow label="Contact (Téléphone)" value={user.number || user.contact || '—'} />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0052CC]/5 p-4 rounded-xl border border-[#0052CC]/10 flex items-start gap-3 mt-4">
                    <ShieldCheck className="w-5 h-5 text-[#0052CC] mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Cette transaction est sécurisée. Les détails de paiement et les informations professionnelles sont liés directement au compte du praticien pour la traçabilité.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    if (!value || value.trim() === ',' || value === '—') {
        value = 'Non renseigné';
    }
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">{label}</span>
            <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
        </div>
    );
}
