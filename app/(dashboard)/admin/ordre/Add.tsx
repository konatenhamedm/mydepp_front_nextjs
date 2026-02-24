"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { ListOrdered } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        code: "",
        libelle: ""
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch("/ordre/create", {
                method: "POST",
                data: form
            });
            toast.success("Ordre créé !");
            setForm({ code: "", libelle: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><ListOrdered className="h-5 w-5" /></div>
                    Nouvel ordre
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
                    <Label>Code <span className="text-red-500">*</span></Label>
                    <Input value={form.code} onChange={set("code")} placeholder="Ex: ONM, ONP" required />
                </div>
                <div className="space-y-2">
                    <Label>Libellé <span className="text-red-500">*</span></Label>
                    <Input value={form.libelle} onChange={set("libelle")} placeholder="Ex: Ordre National des Médecins" required />
                </div>
            </form>
        </Modal>
    );
}
