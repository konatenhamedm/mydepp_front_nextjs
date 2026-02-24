"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Home } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [villes, setVilles] = useState<any[]>([]);
    const [form, setForm] = useState({
        libelle: "",
        ville: ""
    });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/ville/")
                .then(res => setVilles(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => toast.error("Erreur lors du chargement des villes"));
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!form.ville) return toast.error("Veuillez sélectionner une ville");
        setIsSubmitting(true);
        try {
            await apiFetch("/commune/create", {
                method: "POST",
                data: form
            });
            toast.success("Commune créée !");
            setForm({ libelle: "", ville: "" });
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
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Home className="h-5 w-5" /></div>
                    Nouvelle commune
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
                    <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex: Cocody" required />
                </div>
                <div className="space-y-2">
                    <Label>Ville <span className="text-red-500">*</span></Label>
                    <Select value={form.ville} onValueChange={v => setForm(p => ({ ...p, ville: v }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une ville" />
                        </SelectTrigger>
                        <SelectContent>
                            {villes.map(v => (
                                <SelectItem key={v.id} value={v.id.toString()}>{v.libelle}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </form>
        </Modal>
    );
}
