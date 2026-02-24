"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, User, FileText, Layout, Save,
    Camera, Building2, UserCircle, Briefcase,
    Download, FileUp, AlertTriangle, CheckCircle2,
    Trash2, XCircle
} from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { ClientOnly } from "@/components/ui/client-only";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

// ─────────────────────────────────────────
// Configuration des références (Svelte migration)
// ─────────────────────────────────────────
const REFERENCE_MAP = [
    { name: "civilite", url: "/civilite/" },
    { name: "statusPro", url: "/statusPro" },
    { name: "typeDiplome", url: "/typeDiplome" },
    { name: "lieuObtentionDiplome", url: "/lieuDiplome" },
    { name: "nationate", url: "/pays/" },
    { name: "situationProfessionnelle", url: "/situationProfessionnelle/" },
    { name: "region", url: "/region" },
    { name: "ville", url: "/ville" },
    { name: "district", url: "/district" },
    { name: "commune", url: "/commune" },
    { name: "ordre", url: "/ordre" },
];

export default function MonDossierPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("profil");

    // Données de référence
    const [references, setReferences] = useState<any>({});

    // Données utilisateur (Dossier)
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        professionnel: {},
        etablissement: {}
    });

    const [documents, setDocuments] = useState<any[]>([]);
    const [previews, setPreviews] = useState<any>({});
    const [fileToUpload, setFileToUpload] = useState<any>({});

    // ─────────────────────────────────────────
    // Initialisation des données
    // ─────────────────────────────────────────
    useEffect(() => {
        const initPage = async () => {
            if (!user?.personneId) return;

            try {
                setLoading(true);

                // 1. Fetch References (Parallel)
                const refPromises = REFERENCE_MAP.map(obj =>
                    apiFetch(obj.url).then(res => ({ name: obj.name, data: res?.data || [] }))
                );
                const refResults = await Promise.all(refPromises);
                const refObj: any = {};
                refResults.forEach(r => refObj[r.name] = r.data);
                setReferences(refObj);

                // 2. Fetch User Dossier
                const endpoint = user?.type === "ETABLISSEMENT" || user?.typeUser === "ETABLISSEMENT"
                    ? `/etablissement/get/one/${user.personneId}`
                    : `/professionnel/get/one/${user.personneId}`;

                const res = await apiFetch(endpoint);
                const data = res?.data;
                setUserData(data);

                if (user?.type === "ETABLISSEMENT" || user?.typeUser === "ETABLISSEMENT") {
                    setFormData({ etablissement: data?.personne || {} });
                } else {
                    const p = data?.personne || {};
                    setFormData({
                        professionnel: {
                            nom: p.nom || "",
                            prenoms: p.prenoms || "",
                            number: p.number || "",
                            emailPro: p.emailPro || "",
                            appartenirOrdre: p.appartenirOrdre || "non",
                            ordreId: p.ordre?.id || "",
                            numeroInscription: p.numeroInscription || "",
                            appartenirOrganisation: p.appartenirOrganisation || "non",
                            organisationNom: p.organisationNom || "",
                            dateDiplome: p.dateDiplome || "",
                            lieuDiplome: p.lieuDiplome || "",
                            datePremierDiplome: p.datePremierDiplome || "",
                            diplomeLabel: p.diplome || "",
                            situationProId: p.situationPro?.id || "",
                            regionId: p.region?.id || "",
                            districtId: p.district?.id || "",
                            villeId: p.ville?.id || "",
                            communeId: p.commune?.id || "",
                            quartier: p.quartier || "",
                            poleSanitaire: p.poleSanitaire || "",
                            professionnelLibelle: p.professionnel || "",
                            lieuExercicePro: p.lieuExercicePro || "",
                            typeDiplomeId: p.typeDiplome?.id || "",
                            statusProId: p.statusPro?.id || "",
                            lieuObtentionDiplomeId: p.lieuObtentionDiplome?.id || "",
                        }
                    });
                }

                // 3. Extract Documents
                const docFields = ["photo", "cv", "casier", "certificat", "diplomeFile", "cni"];
                const p = data?.personne || {};
                const extractedDocs: any[] = [];
                docFields.forEach(field => {
                    if (p[field] && p[field].url) {
                        extractedDocs.push({
                            id: field,
                            libelle: field.toUpperCase(),
                            url: p[field].url,
                            status: "validé"
                        });
                    }
                });
                setDocuments(extractedDocs);

            } catch (err) {
                console.error("Init page error:", err);
                toast.error("Erreur lors du chargement des données.");
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [user?.personneId, user?.type, user?.typeUser]);

    // ─────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────
    const handleChange = (field: string, value: any, section: 'professionnel' | 'etablissement') => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileToUpload((prev: any) => ({ ...prev, [fieldName]: file }));
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setPreviews((prev: any) => ({ ...prev, [fieldName]: ev.target?.result }));
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews((prev: any) => ({ ...prev, [fieldName]: "/PDF.png" }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = new FormData();
            const section = user?.type === "ETABLISSEMENT" || user?.typeUser === "ETABLISSEMENT" ? 'etablissement' : 'professionnel';
            const data = formData[section];

            if (section === 'etablissement') {
                Object.entries(data).forEach(([key, val]) => payload.append(key, val as any));
            } else {
                // Mapping professionnel fields to backend expectancies
                payload.append("nom", data.nom);
                payload.append("prenoms", data.prenoms);
                payload.append("numero", data.number);
                payload.append("emailPro", data.emailPro);
                payload.append("dateDiplome", data.dateDiplome);
                payload.append("lieuDiplome", data.lieuDiplome);
                payload.append("datePremierDiplome", data.datePremierDiplome);
                payload.append("diplome", data.diplomeLabel);
                payload.append("situationPro", data.situationProId);
                payload.append("region", data.regionId);
                payload.append("district", data.districtId);
                payload.append("ville", data.villeId);
                payload.append("commune", data.communeId);
                payload.append("quartier", data.quartier);
                payload.append("poleSanitaire", data.poleSanitaire);
                payload.append("professionnel", data.professionnelLibelle);
                payload.append("lieuExercicePro", data.lieuExercicePro);
                payload.append("appartenirOrdre", data.appartenirOrdre);
                payload.append("ordre", data.ordreId || "");
                payload.append("numeroInscription", data.numeroInscription || "");
                payload.append("appartenirOrganisation", data.appartenirOrganisation);
                payload.append("organisationNom", data.organisationNom || "");
            }

            const res = await apiFetch(`${section}/update/${user.personneId}`, {
                method: "POST",
                body: payload,
            });

            if (res?.code === 200) {
                toast.success("Profil mis à jour avec succès !");
            } else {
                toast.error("Erreur lors de la mise à jour.");
            }
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("Une erreur est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDocuments = async () => {
        setSubmitting(true);
        try {
            const payload = new FormData();
            Object.entries(fileToUpload).forEach(([key, file]) => {
                payload.append(key, file as any);
            });

            const res = await apiFetch(`/professionnel/update-all-documents/${user.id}`, {
                method: "POST",
                body: payload
            });

            if (res?.code === 200) {
                toast.success("Documents envoyés avec succès !");
                // Reload page or update state
                window.location.reload();
            } else {
                toast.error("Erreur lors de l'envoi des documents.");
            }
        } catch (err) {
            console.error("Docs update error:", err);
            toast.error("Erreur technique lors de l'envoi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const isETABLISSEMENT = user?.type === "ETABLISSEMENT" || user?.typeUser === "ETABLISSEMENT";
    const currentStatus = userData?.personne?.status;

    return (
        <ClientOnly>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">

                {/* ── Header ── */}
                <div className="bg-[#0052CC] text-white rounded-3xl p-8 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tight">Mise à jour du dossier</h1>
                                <p className="text-blue-100 text-sm opacity-80">Gérez vos informations personnelles et professionnelles</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold leading-none">{userData?.nom}</p>
                                <p className="text-[10px] text-blue-200">{userData?.username}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm w-full md:w-auto h-auto grid grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="profil" className="rounded-xl data-[state=active]:bg-[#0052CC] data-[state=active]:text-white flex items-center gap-2 py-3">
                            <UserCircle className="w-4 h-4" />
                            Profil
                        </TabsTrigger>
                        {!isETABLISSEMENT && (
                            <>
                                <TabsTrigger value="infoPro" className="rounded-xl data-[state=active]:bg-[#0052CC] data-[state=active]:text-white flex items-center gap-2 py-3">
                                    <Briefcase className="w-4 h-4" />
                                    Info Pro
                                </TabsTrigger>
                                <TabsTrigger value="organisation" className="rounded-xl data-[state=active]:bg-[#0052CC] data-[state=active]:text-white flex items-center gap-2 py-3">
                                    <Building2 className="w-4 h-4" />
                                    Organisation
                                </TabsTrigger>
                            </>
                        )}
                        <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-[#0052CC] data-[state=active]:text-white flex items-center gap-2 py-3">
                            <FileText className="w-4 h-4" />
                            Documents <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[10px]">{documents.length}</span>
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <TabsContent value="profil" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {isETABLISSEMENT ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Dénomination</Label>
                                                <Input value={formData.etablissement.denomination || ""} onChange={(e) => handleChange('denomination', e.target.value, 'etablissement')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nom du représentant</Label>
                                                <Input value={formData.etablissement.nomRepresentant || ""} onChange={(e) => handleChange('nomRepresentant', e.target.value, 'etablissement')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Adresse</Label>
                                                <Input value={formData.etablissement.adresse || ""} onChange={(e) => handleChange('adresse', e.target.value, 'etablissement')} className="rounded-xl h-12" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Nom</Label>
                                                <Input value={formData.professionnel.nom} onChange={(e) => handleChange('nom', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Prénoms</Label>
                                                <Input value={formData.professionnel.prenoms} onChange={(e) => handleChange('prenoms', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Numéro de téléphone</Label>
                                                <Input value={formData.professionnel.number} onChange={(e) => handleChange('number', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email Professionnel</Label>
                                                <Input value={formData.professionnel.emailPro} onChange={(e) => handleChange('emailPro', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Email du compte (Identifiant)</Label>
                                                <Input value={userData?.username} disabled className="rounded-xl h-12 bg-slate-50 cursor-not-allowed" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {!isETABLISSEMENT && (
                            <>
                                <TabsContent value="infoPro" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <Label>Profession</Label>
                                                <Input value={userData?.personne?.profession?.libelle || ""} disabled className="rounded-xl h-12 bg-slate-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Numéro d'inscription au registre</Label>
                                                <Input value={userData?.personne?.code || ""} disabled className="rounded-xl h-12 bg-slate-50" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Date d'obtention du diplôme</Label>
                                                <Input type="date" value={formData.professionnel.dateDiplome} onChange={(e) => handleChange('dateDiplome', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Lieu d'obtention du diplôme</Label>
                                                <Input value={formData.professionnel.lieuDiplome} onChange={(e) => handleChange('lieuDiplome', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Situation professionnelle</Label>
                                                <Select value={formData.professionnel.situationProId} onValueChange={(val) => handleChange('situationProId', val, 'professionnel')}>
                                                    <SelectTrigger className="h-12 rounded-xl">
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {references.situationProfessionnelle?.map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>{item.libelle}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Région sanitaire</Label>
                                                <Select value={formData.professionnel.regionId} onValueChange={(val) => handleChange('regionId', val, 'professionnel')}>
                                                    <SelectTrigger className="h-12 rounded-xl">
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {references.region?.map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>{item.libelle}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>District sanitaire</Label>
                                                <Select value={formData.professionnel.districtId} onValueChange={(val) => handleChange('districtId', val, 'professionnel')}>
                                                    <SelectTrigger className="h-12 rounded-xl">
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {references.district?.map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>{item.libelle}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Ville</Label>
                                                <Select value={formData.professionnel.villeId} onValueChange={(val) => handleChange('villeId', val, 'professionnel')}>
                                                    <SelectTrigger className="h-12 rounded-xl">
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {references.ville?.map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>{item.libelle}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Structure d'exercice professionnel</Label>
                                                <Input value={formData.professionnel.professionnelLibelle} onChange={(e) => handleChange('professionnelLibelle', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Lieu d'exercice professionnel</Label>
                                                <Input value={formData.professionnel.lieuExercicePro} onChange={(e) => handleChange('lieuExercicePro', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="organisation" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800">Appartenance à un ordre</h4>
                                                <p className="text-xs text-slate-500">Êtes-vous inscrit à l'ordre national de votre profession ?</p>
                                            </div>
                                            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-inner">
                                                {['oui', 'non'].map((val) => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => handleChange('appartenirOrdre', val, 'professionnel')}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.professionnel.appartenirOrdre === val ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.professionnel.appartenirOrdre === "oui" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                                                <div className="space-y-2">
                                                    <Label>Choisir l'ordre</Label>
                                                    <Select value={formData.professionnel.ordreId} onValueChange={(val) => handleChange('ordreId', val, 'professionnel')}>
                                                        <SelectTrigger className="h-12 rounded-xl">
                                                            <SelectValue placeholder="Sélectionnez..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {references.ordre?.map((item: any) => (
                                                                <SelectItem key={item.id} value={item.id.toString()}>{item.libelle}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Numéro d'inscription</Label>
                                                    <Input value={formData.professionnel.numeroInscription} onChange={(e) => handleChange('numeroInscription', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800">Appartenance à une organisation</h4>
                                                <p className="text-xs text-slate-500">Ex: Association locale, syndicat, etc.</p>
                                            </div>
                                            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-inner">
                                                {['oui', 'non'].map((val) => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => handleChange('appartenirOrganisation', val, 'professionnel')}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.professionnel.appartenirOrganisation === val ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.professionnel.appartenirOrganisation === "oui" && (
                                            <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                                <Label>Nom de l'organisation</Label>
                                                <Input value={formData.professionnel.organisationNom} onChange={(e) => handleChange('organisationNom', e.target.value, 'professionnel')} className="rounded-xl h-12" />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </>
                        )}

                        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-8">
                                {/* ── Document List ── */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6">Documents soumis</h3>
                                    {documents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{doc.libelle}</p>
                                                            <p className="text-[10px] text-slate-400">Fichier validé</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`https://backend.leadagro.net/uploads/${doc.url}`}
                                                        target="_blank"
                                                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                            <FileUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 text-sm">Aucun document validé pour le moment.</p>
                                        </div>
                                    )}
                                </div>

                                {/* ── Update Section (Only if status matches) ── */}
                                {(currentStatus === "refuse_mise_a_jour" || documents.length === 0) && (
                                    <div className="bg-white border border-rose-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <AlertTriangle className="w-32 h-32 text-rose-600" />
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                                                    <AlertTriangle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-rose-900">Mise à jour des documents requise</h3>
                                                    <p className="text-xs text-rose-600">Veuillez renvoyer vos documents pour validation.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {[
                                                    { id: "photo", label: "Photo d'identité", accept: "image/*" },
                                                    { id: "cni", label: "Carte nationale d'identité", accept: "image/*,application/pdf" },
                                                    { id: "diplomeFile", label: "Diplôme officiel", accept: "image/*,application/pdf" },
                                                    { id: "casier", label: "Casier judiciaire", accept: "image/*,application/pdf" },
                                                    { id: "certificat", label: "Certificat d'inscription", accept: "image/*,application/pdf" },
                                                    { id: "cv", label: "Curriculum Vitae", accept: "image/*,application/pdf" }
                                                ].map((upload) => (
                                                    <div key={upload.id} className="space-y-4">
                                                        <Label className="text-slate-700 font-bold">{upload.label}</Label>
                                                        <div className="flex gap-4">
                                                            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                {previews[upload.id] ? (
                                                                    <img src={previews[upload.id]} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Camera className="w-8 h-8 text-slate-300" />
                                                                )}
                                                            </div>
                                                            <div className="flex-grow flex flex-col justify-center gap-2">
                                                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-center transition-all border border-slate-200">
                                                                    {fileToUpload[upload.id] ? "Changer" : "Choisir un fichier"}
                                                                    <input type="file" className="hidden" accept={upload.accept} onChange={(e) => handleFileUpload(e, upload.id)} />
                                                                </label>
                                                                {fileToUpload[upload.id] && (
                                                                    <p className="text-[10px] text-emerald-600 font-medium truncate max-w-[150px]">
                                                                        {fileToUpload[upload.id].name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-12 flex justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={handleSaveDocuments}
                                                    disabled={submitting || Object.keys(fileToUpload).length === 0}
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20"
                                                >
                                                    {submitting ? "Envoi..." : "Renvoyer mon dossier"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ── Fixed Footer Action Bar ── */}
                        {activeTab !== "documents" && (
                            <div className="sticky bottom-8 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-3xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-8 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Modifications non enregistrées</p>
                                        <p className="text-[10px] text-slate-400">Assurez-vous de sauvegarder avant de quitter.</p>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#0052CC] hover:bg-blue-700 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                                >
                                    {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
                                    {!submitting && <Save className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        )}
                    </form>
                </Tabs>

            </div>
        </ClientOnly>
    );
}
