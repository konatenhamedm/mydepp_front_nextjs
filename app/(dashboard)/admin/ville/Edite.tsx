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
    const [districts, setDistricts] = useState<any[]>([]);
    const [form, setForm] = useState({
        code: "",
        libelle: "",
        district: ""
    });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/district/")
                .then(res => setDistricts(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => toast.error("Erreur lors du chargement des districts"));
        }
    }, [isOpen]);

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                code: data.code || "",
                libelle: data.libelle || "",
                district: data.district?.id?.toString() || data.districtId?.toString() || data.district?.toString() || ""
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/ville/update/${data.id}`, {
                method: "PUT",
                data: form
            });
            toast.success("Ville mise à jour !");
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
                    Modifier la ville
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Code <span className="text-red-500">*</span></Label>
                        <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="Ex: ABJ" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Libellé <span className="text-red-500">*</span></Label>
                        <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Ex: Abidjan" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>District <span className="text-red-500">*</span></Label>
                    <Select value={form.district} onValueChange={v => setForm(p => ({ ...p, district: v }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un district" />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map(d => (
                                <SelectItem key={d.id} value={d.id.toString()}>{d.libelle}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </form>
        </Modal>
    );
}
