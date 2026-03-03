"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Info, MapPin, Mail, Phone, Calendar, ShieldCheck, UserCircle, Briefcase, FileText, FileSignature, Receipt, Image as ImageIcon } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";
import { Tabs, Tab } from "@nextui-org/react";
import { FicheInscription } from "@/app/(dashboard)/admin/components/business-docs/FicheInscription";
import { RecuPaiement } from "@/app/(dashboard)/admin/components/business-docs/RecuPaiement";
import { DocViewer } from "@/app/(dashboard)/admin/components/business-docs/DocViewer";
import { BASE_URL_UPLOAD } from "@/lib/axios";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function ShowDetails({ isOpen, onClose, data, size = "full" }: Props) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    if (!data) return null;

    const p = data.personne || data || {};

    // Construct URLs
    const getDocUrl = (docObj: any) => {
        if (!docObj || !docObj.path) return null;
        return `${BASE_URL_UPLOAD}${docObj.path}/${docObj.alt || ""}`;
    };

    const docs = {
        cv: getDocUrl(p.cv),
        diplome: getDocUrl(p.diplomeFile),
        cni: getDocUrl(p.cni),
        photo: getDocUrl(p.photo),
        casier: getDocUrl(p.casier),
        certificat: getDocUrl(p.certificat),
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { setSelectedDoc(null); onClose(); }}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><UserCircle className="h-5 w-5" /></div>
                    Détails du Professionnel
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
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#0052CC] shadow-sm">
                            <UserCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {p.nom} {p.prenoms}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 text-slate-800 font-bold text-sm">
                                <Briefcase className="w-4 h-4" /> {p.profession?.libelle || "Profession non spécifiée"}
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs
                    aria-label="Options de détails"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-[#0052CC]",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-[#0052CC] font-bold text-slate-800"
                    }}
                    onSelectionChange={() => setSelectedDoc(null)}
                >
                    <Tab key="informations" title="Informations">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {/* Colonne 1: Infos contact */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Info className="w-4 h-4" /> Informations de contact
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Civilité" value={p.civilite?.libelle} icon={<UserCircle className="w-3.5 h-3.5" />} />
                                    <InfoRow label="Email principal" value={p.emailUser || p.email} icon={<Mail className="w-3.5 h-3.5" />} />
                                    <InfoRow label="Téléphone" value={p.number || p.telephone} icon={<Phone className="w-3.5 h-3.5" />} />
                                    <InfoRow label="Lieu de naissance" value={p.lieuNaissance} icon={<MapPin className="w-3.5 h-3.5" />} />
                                    <InfoRow label="Date de naissance" value={p.dateNaissance ? new Date(p.dateNaissance).toLocaleDateString("fr-FR") : null} icon={<Calendar className="w-3.5 h-3.5" />} />
                                    <InfoRow label="Sexe" value={p.genre?.libelle} />
                                    <InfoRow label="Nationalité" value={p.nationate?.libelle || p.pays?.libelle} />
                                    <InfoRow label="Organisation" value={p.appartenirOrganisation === "oui" ? `Affilié (${p.organisationNom || ""})` : (p.appartenirOrganisation === "non" ? "Non" : "")} />
                                    <InfoRow label="Ordre Prof." value={p.appartenirOrdre === "oui" ? `Inscrit (${p.numeroInscription || ""})` : (p.appartenirOrdre === "non" ? "Non" : "")} />
                                </div>
                            </div>

                            {/* Colonne : Localisation */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <MapPin className="w-4 h-4" /> Localisation
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Région" value={p.region?.libelle} />
                                    <InfoRow label="District" value={p.district?.libelle} />
                                    <InfoRow label="Ville" value={p.ville?.libelle} />
                                    <InfoRow label="Commune" value={p.commune?.libelle} />
                                    <InfoRow label="Quartier" value={p.quartier} />
                                    <InfoRow label="Lot / Ilot" value={p.poleSanitaire} />
                                </div>
                            </div>

                            {/* Colonne 2: Infos professionnelles */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Briefcase className="w-4 h-4" /> Informations Professionnelles
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Profession" value={p.profession?.libelle} />
                                    <InfoRow label="Spécialité / Diplôme" value={p.diplome} />
                                    <InfoRow label="Lieu diplôme" value={p.lieuDiplome} />
                                    <InfoRow label="Date d'obtention" value={p.dateDiplome ? new Date(p.dateDiplome).toLocaleDateString("fr-FR") : null} />
                                    <InfoRow label="Situation prof." value={p.situationProfessionnelle?.libelle || p.situationPro?.libelle} />
                                    <InfoRow label="Structure / Employeur" value={p.professionnel} />
                                    <InfoRow label="Lieu d'exercice" value={p.lieuExercicePro} />
                                    <InfoRow label="Date. prem. emploi" value={p.datePremierDiplome ? new Date(p.datePremierDiplome).toLocaleDateString("fr-FR") : null} />
                                </div>
                            </div>

                            {/* Colonne 3: Imputation et état */}
                            <div className="space-y-4 md:col-span-2 lg:col-span-3 mt-2">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <ShieldCheck className="w-4 h-4" /> État du dossier
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-xs font-bold text-slate-800">Statut du dossier</span>
                                            <Badge className="bg-slate-100 text-slate-800 shadow-none">
                                                {p.status || "INCONNU"}
                                            </Badge>
                                        </div>
                                        <InfoRow label="Motif de refus" value={p.reason || p.raison} />
                                    </div>
                                    <div className="space-y-3">
                                        <InfoRow label="Code Généré" value={p.code} />
                                        <InfoRow label="Inspecteur assigné" value={p.imputationData?.username || "Non assigné"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    <Tab key="documents" title="Génération & Documents">
                        <div className="flex flex-col md:flex-row gap-6 mt-4">
                            {/* Liste des documents */}
                            <div className="w-full md:w-1/3 flex flex-col gap-2">
                                <h3 className="text-sm font-bold text-slate-800 mb-2">Documents disponibles</h3>

                                <DocButton title="Fiche d'Inscription" icon={<FileSignature className="w-4 h-4" />} isActive={selectedDoc === "fiche"} onClick={() => setSelectedDoc("fiche")} variant="blue" />
                                <DocButton title="Reçu de Paiement" icon={<Receipt className="w-4 h-4" />} isActive={selectedDoc === "recu"} onClick={() => setSelectedDoc("recu")} variant="green" />

                                <div className="h-px bg-slate-200 my-2" />

                                <DocButton title="CV" icon={<FileText className="w-4 h-4" />} isActive={selectedDoc === "cv"} onClick={() => setSelectedDoc("cv")} disabled={!docs.cv} />
                                <DocButton title="Diplôme" icon={<FileText className="w-4 h-4" />} isActive={selectedDoc === "diplome"} onClick={() => setSelectedDoc("diplome")} disabled={!docs.diplome} />
                                <DocButton title="CNI" icon={<ImageIcon className="w-4 h-4" />} isActive={selectedDoc === "cni"} onClick={() => setSelectedDoc("cni")} disabled={!docs.cni} />
                                <DocButton title="Casier Judiciaire" icon={<FileText className="w-4 h-4" />} isActive={selectedDoc === "casier"} onClick={() => setSelectedDoc("casier")} disabled={!docs.casier} />
                                <DocButton title="Certificat Médical" icon={<FileText className="w-4 h-4" />} isActive={selectedDoc === "certificat"} onClick={() => setSelectedDoc("certificat")} disabled={!docs.certificat} />
                                <DocButton title="Photo" icon={<ImageIcon className="w-4 h-4" />} isActive={selectedDoc === "photo"} onClick={() => setSelectedDoc("photo")} disabled={!docs.photo} />
                            </div>

                            {/* Afficheur */}
                            <div className="w-full md:w-2/3 min-h-[500px] border border-slate-200 rounded-xl bg-slate-50 overflow-hidden flex flex-col">
                                {!selectedDoc ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-bold text-slate-800">Sélectionnez un document à afficher</p>
                                    </div>
                                ) : (
                                    <>
                                        {selectedDoc === "fiche" && <FicheInscription data={data} />}
                                        {selectedDoc === "recu" && <RecuPaiement data={data} />}
                                        {selectedDoc !== "fiche" && selectedDoc !== "recu" && (
                                            <DocViewer url={docs[selectedDoc as keyof typeof docs]} alt={selectedDoc} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </Modal>
    );
}

function InfoRow({ label, value, icon }: { label: string, value: any, icon?: React.ReactNode }) {
    if (!value || String(value).trim() === ',' || String(value).trim() === '') {
        value = '—';
    }
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition-colors flex items-center gap-1.5">
                {icon && <span className="opacity-70">{icon}</span>}
                {label}
            </span>
            <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
        </div>
    );
}

function DocButton({ title, icon, isActive, onClick, disabled, variant = "default" }: any) {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left w-full";
    let variantClass = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300";

    if (disabled) {
        variantClass = "border-slate-200 bg-slate-50 text-slate-800 cursor-not-allowed font-bold";
    } else if (isActive) {
        if (variant === "blue") variantClass = "border-[#0052CC] bg-blue-50 text-[#0052CC] shadow-[0_4px_12px_rgba(0,82,204,0.1)]";
        else if (variant === "green") variantClass = "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.1)]";
        else variantClass = "border-slate-800 bg-slate-800 text-white shadow-md";
    }

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variantClass}`}>
            {icon}
            <span className="flex-1">{title}</span>
        </button>
    );
}
