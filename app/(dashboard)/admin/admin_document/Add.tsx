"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        path: null as File | null
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!form.path) return toast.error("Veuillez sélectionner un fichier");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("libelle", form.libelle);
        formData.append("path", form.path);

        try {
            // Using direct fetch or axios because apiFetch might not be configured for multipart/form-data with raw FormData in some wrappers
            // But let's assume apiFetch handles it or use the same pattern as Svelte
            await apiFetch("/adminDocument/create", {
                method: "POST",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Document ajouté !");
            setForm({ libelle: "", path: null });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'ajout");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><FileText className="h-5 w-5" /></div>
                    Nouveau document
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Envoi..." : "Enregistrer"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Libellé <span className="text-red-500">*</span></Label>
                    <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex: Modèle d'attestation" required />
                </div>

                <div className="space-y-2">
                    <Label>Fichier document <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col gap-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                                <p className="text-sm text-slate-500 truncate max-w-[200px]">
                                    {form.path ? form.path.name : "Cliquez pour sélectionner un fichier"}
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={e => {
                                    if (e.target.files?.[0]) {
                                        setForm(p => ({ ...p, path: e.target.files![0] }));
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
