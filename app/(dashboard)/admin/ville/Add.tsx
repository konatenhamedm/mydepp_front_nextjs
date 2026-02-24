"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!form.district) return toast.error("Veuillez sélectionner un district");
        setIsSubmitting(true);
        try {
            await apiFetch("/ville/create", {
                method: "POST",
                data: form
            });
            toast.success("Ville créée !");
            setForm({ code: "", libelle: "", district: "" });
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
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><MapPin className="h-5 w-5" /></div>
                    Nouvelle ville
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
