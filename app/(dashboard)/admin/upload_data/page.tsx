"use client";

import React, { useEffect, useState, useRef } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { PageHeader, PrimaryButton } from "@/components/ui/page-components";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UploadDataPage() {
    const [specialites, setSpecialites] = useState<any[]>([]);
    const [selectedSpecialite, setSelectedSpecialite] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsLoadingOptions(true);
        apiFetch("/profession/")
            .then((res) => {
                setSpecialites(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoadingOptions(false);
            })
            .catch(() => setIsLoadingOptions(false));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(e.dataTransfer.files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpecialite) {
            toast.error("Veuillez choisir une spécialité");
            return;
        }
        if (!files || files.length === 0) {
            toast.error("Veuillez sélectionner au moins un fichier");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("path", files[0]); // Adapting slightly from Svelte code

        try {
            await apiFetch("/upload/upload-excel/files", {
                method: "POST",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data" // axios sets boundary automatically usually, but let's be explicit if using apiFetch it might block it if custom. Actually, axios does this automatically. If apiFetch is custom and forces application/json, we might have an issue. Assuming apiFetch handles FormData well.
                }
            });
            const specName = specialites.find(s => s.id === selectedSpecialite)?.libelle;
            toast.success(`Fichier envoyé avec succès pour ${specName}`);
            setFiles(null);
            setSelectedSpecialite("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi du fichier");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ClientOnly>
            <div className="space-y-6 max-w-2xl mx-auto py-8">
                <PageHeader
                    title="Upload de fichiers"
                    description="Importez des données Excel/CSV par spécialité"
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Spécialité */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">Spécialité concernée <span className="text-red-500">*</span></Label>
                            <Select value={selectedSpecialite} onValueChange={setSelectedSpecialite} disabled={isLoadingOptions}>
                                <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200">
                                    <SelectValue placeholder={isLoadingOptions ? "Chargement des spécialités..." : "Choisir une spécialité"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialites.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.libelle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Dropzone */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">Fichiers à importer <span className="text-red-500">*</span></Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${files ? 'border-emerald-300 bg-emerald-50' : 'border-[#0052CC]/30 bg-[#0052CC]/5 hover:bg-[#0052CC]/10'}`}
                            >
                                {files ? (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <p className="font-semibold text-emerald-800 text-lg">{files[0].name}</p>
                                        <p className="text-sm text-emerald-600 mt-1">{(files[0].size / 1024).toFixed(1)} KB</p>
                                        <p className="text-sm text-slate-500 mt-4 underline decoration-dotted">Cliquez pour changer de fichier</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white text-[#0052CC] rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <p className="font-semibold text-slate-700 text-lg">Cliquez ou glissez-déposez</p>
                                        <p className="text-sm text-slate-500 mt-2">Fichiers Excel (.xls, .xlsx) ou CSV</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                                onChange={handleFileChange}
                            />
                        </div>

                        <PrimaryButton type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !files || !selectedSpecialite}>
                            {isSubmitting ? "Envoi en cours..." : "Lancer l'importation"}
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </ClientOnly>
    );
}
