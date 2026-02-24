"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    useEffect(() => {
        if (data) setLibelle(data.libelle || "");
    }, [data]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/roles/marchands/${data.id}/update`, {
                method: "PUT",
                data: {
                    libelle: libelle,
                    user_owner_id: 1 // Payload imposé par le USER
                }
            });
            toast.success("Rôle marchand modifié !");
            onSuccess(); onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification");
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
                    <div className="bg-white/20 p-2 rounded-lg"><Edit3 className="h-5 w-5" /></div>
                    Modifier le rôle marchand
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
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Libellé du rôle *</Label>
                    <Input
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        required
                        className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                    />
                </div>
            </form>
        </Modal>
    );
}
