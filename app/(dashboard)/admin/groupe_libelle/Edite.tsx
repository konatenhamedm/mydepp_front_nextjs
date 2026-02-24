"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        type: ""
    });

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                libelle: data.libelle || "",
                type: data.type || ""
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/libelleGroupe/update/${data.id}`, {
                method: "PUT",
                data: form
            });
            toast.success("Groupe mis à jour !");
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
                    Modifier le groupe
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
                    <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex: Documents personnels" required />
                </div>
                <div className="space-y-2">
                    <Label>Type <span className="text-red-500">*</span></Label>
                    <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACP">Accord de principe</SelectItem>
                            <SelectItem value="OEP">Ouverture d'Exploitation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </form>
        </Modal>
    );
}
