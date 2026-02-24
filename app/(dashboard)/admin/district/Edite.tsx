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
    const [regions, setRegions] = useState<any[]>([]);
    const [form, setForm] = useState({
        libelle: "",
        region: ""
    });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/region/")
                .then(res => setRegions(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => toast.error("Erreur lors du chargement des régions"));
        }
    }, [isOpen]);

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                libelle: data.libelle || "",
                region: data.region?.id?.toString() || data.regionId?.toString() || data.region?.toString() || ""
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/district/update/${data.id}`, {
                method: "PUT",
                data: form
            });
            toast.success("District mis à jour !");
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
                    Modifier le district
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
                    <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex: District Autonome" required />
                </div>
                <div className="space-y-2">
                    <Label>Région <span className="text-red-500">*</span></Label>
                    <Select value={form.region} onValueChange={v => setForm(p => ({ ...p, region: v }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                            {regions.map(r => (
                                <SelectItem key={r.id} value={r.id.toString()}>{r.libelle}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </form>
        </Modal>
    );
}
