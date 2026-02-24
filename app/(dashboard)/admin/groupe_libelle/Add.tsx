"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        type: ""
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!form.type) return toast.error("Veuillez sélectionner un type");
        setIsSubmitting(true);
        try {
            await apiFetch("/libelleGroupe/create", {
                method: "POST",
                data: form
            });
            toast.success("Groupe de libellé créé !");
            setForm({ libelle: "", type: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
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
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Tags className="h-5 w-5" /></div>
                    Nouveau groupe de libellé
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer"}
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
