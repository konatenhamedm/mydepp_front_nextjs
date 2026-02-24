"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { ShieldPlus } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch("/roles/marchand/create", {
                method: "POST",
                data: {
                    libelle: libelle,
                    user_owner_id: 1 // Payload imposé par le USER
                }
            });
            toast.success("Rôle marchand créé !");
            setLibelle(""); onSuccess(); onClose();
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
                    <div className="bg-white/20 p-2 rounded-lg"><ShieldPlus className="h-5 w-5" /></div>
                    Nouveau rôle marchand
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
                        placeholder="Ex: Admin, Vendeur..."
                        required
                        className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                    />
                </div>
                <p className="text-xs text-slate-400 italic">
                    Note: Le rôle sera rattaché au propriétaire par défaut (ID: 1).
                </p>
            </form>
        </Modal>
    );
}
