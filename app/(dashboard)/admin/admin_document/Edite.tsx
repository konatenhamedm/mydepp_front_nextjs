"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        path: null as File | null
    });

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                libelle: data.libelle || "",
                path: null
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("libelle", form.libelle);
        if (form.path) {
            formData.append("path", form.path);
        }

        try {
            await apiFetch(`/adminDocument/update/${data.id}`, {
                method: "POST", // Often Laravel/PHP APIs use POST with _method=PUT or just different endpoints for multipart updates
                data: formData,
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Document mis à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
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
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Edit2 className="h-5 w-5" /></div>
                    Modifier le document
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Mise à jour..." : "Mettre à jour"}
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
                    <Label>Nouveu fichier (optionnel)</Label>
                    <div className="flex flex-col gap-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                                <p className="text-sm text-slate-500 truncate max-w-[200px]">
                                    {form.path ? form.path.name : "Cliquez pour remplacer le fichier"}
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
