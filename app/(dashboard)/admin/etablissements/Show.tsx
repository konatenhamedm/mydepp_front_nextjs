"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, Building2, MapPin, User, Mail, Phone, Calendar, ShieldCheck, FileText, Landmark, Hash } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "lg" }: Props) {
    if (!data) return null;
    const p = data.personne || {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Building2 className="h-5 w-5" /></div>
                    Détails de l'Établissement
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
                {/* Profile Header */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge className="bg-[#0052CC] text-white border-0 shadow-lg shadow-[#0052CC]/20 px-3 py-1">
                            Dossier {p.status?.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                        <Building2 className="w-10 h-10 text-[#0052CC]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                            {p.denomination || p.nomRepresentant || 'Établissement sans nom'}
                        </h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="flex items-center gap-2 text-sm text-slate-900 font-black">
                                <Landmark className="w-4 h-4 text-slate-800" /> {p.typeEtablissement?.libelle || 'Type non spécifié'}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-slate-900 font-black border-l border-slate-300 pl-4">
                                <Hash className="w-4 h-4 text-slate-800" /> ID Compte: #{data.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                    {/* Colonne 1: Identification & Contacts */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Identification & Contacts
                        </h3>
                        <div className="space-y-4">
                            <InfoRow icon={<User className="w-4 h-4" />} label="Représentant" value={p.nomRepresentant || '—'} />
                            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email Professionnel" value={p.emailAutre || data.email || '—'} />
                            <InfoRow icon={<Phone className="w-4 h-4" />} label="Téléphone" value={p.telephone || '—'} />
                            <InfoRow icon={<FileText className="w-4 h-4" />} label="Type de personne" value={p.typePersonne?.libelle || '—'} />
                        </div>
                    </div>

                    {/* Colonne 2: Localisation & Suivi */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Localisation & Suivi
                        </h3>
                        <div className="space-y-4">
                            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Localisation" value={`${p.commune?.libelle || ''}, ${p.ville?.libelle || ''} ${p.region?.libelle ? `(${p.region.libelle})` : ''}`} />
                            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Dernière mise à jour" value={data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '—'} />
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Imputation Actuelle</span>
                                {p.imputationData ? (
                                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                                        <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]"><User className="w-3 h-3" /></div>
                                        {p.imputationData.username}
                                    </div>
                                ) : (
                                    <span className="text-emerald-900 text-xs font-black italic">Aucun agent assigné</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-900 font-bold leading-relaxed">
                        Ce profil d'établissement regroupe toutes les informations administratives déclarées lors du dépôt de dossier.
                        Le statut actuel <strong>{p.status}</strong> détermine les étapes suivantes du workflow d'homologation.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    if (!value || value.trim() === ',' || value === '—') {
        value = 'Non renseigné';
    }
    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 text-slate-900">{icon}</div>
            <div>
                <span className="block text-[10px] font-black text-slate-900 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
            </div>
        </div>
    );
}
