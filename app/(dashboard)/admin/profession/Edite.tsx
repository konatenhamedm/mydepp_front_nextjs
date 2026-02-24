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

export function Edite({ isOpen, onClose, onSuccess, data, size = "lg" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [typeProfessions, setTypeProfessions] = useState<any[]>([]);
    const [form, setForm] = useState({
        code: "",
        libelle: "",
        codeGeneration: "",
        typeProfession: "",
        montantRenouvellement: "",
        montantNouvelleDemande: "",
        chronoMax: "",
    });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/typeProfession/")
                .then(res => setTypeProfessions(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => toast.error("Erreur lors du chargement des types de profession"));
        }
    }, [isOpen]);

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                code: data.code || "",
                libelle: data.libelle || "",
                codeGeneration: data.codeGeneration || "",
                typeProfession: data.typeProfession?.id?.toString() || data.typeProfessionId?.toString() || data.typeProfession?.toString() || "",
                montantRenouvellement: data.montantRenouvellement || "",
                montantNouvelleDemande: data.montantNouvelleDemande || "",
                chronoMax: data.chronoMax || "",
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/profession/update/${data.id}`, {
                method: "PUT",
                data: form
            });
            toast.success("Profession mise à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Edit2 className="h-5 w-5" /></div>
                    Modifier la profession
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
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Code <span className="text-red-500">*</span></Label>
                        <Input value={form.code} onChange={e => set("code")(e.target.value)} placeholder="Ex: MED" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Libellé <span className="text-red-500">*</span></Label>
                        <Input value={form.libelle} onChange={e => set("libelle")(e.target.value)} placeholder="Ex: Médecin" required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Code de génération</Label>
                        <Input value={form.codeGeneration} onChange={e => set("codeGeneration")(e.target.value)} placeholder="Ex: PROF" />
                    </div>
                    <div className="space-y-2">
                        <Label>Type de profession <span className="text-red-500">*</span></Label>
                        <Select value={form.typeProfession} onValueChange={set("typeProfession")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeProfessions.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>{t.libelle}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Montant Nouv. Demande (FCFA)</Label>
                        <Input type="number" value={form.montantNouvelleDemande} onChange={e => set("montantNouvelleDemande")(e.target.value)} placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label>Montant Renouvellement (FCFA)</Label>
                        <Input type="number" value={form.montantRenouvellement} onChange={e => set("montantRenouvellement")(e.target.value)} placeholder="0" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Délai Chrono Max (jours)</Label>
                    <Input type="number" value={form.chronoMax} onChange={e => set("chronoMax")(e.target.value)} placeholder="Ex: 30" />
                </div>
            </form>
        </Modal>
    );
}
