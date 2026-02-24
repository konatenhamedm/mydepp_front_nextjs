"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Delete({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await apiFetch(`/pays/delete/${data.id}`, {
                method: "DELETE"
            });
            toast.success("Pays supprimé !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression");
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
                    <div className="bg-red-50 p-2 rounded-lg text-red-600"><Trash2 className="h-5 w-5" /></div>
                    Supprimer le pays
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleDelete}
                    confirmText={isSubmitting ? "Suppression..." : "Supprimer"}
                    confirmVariant="destructive"
                    isLoading={isSubmitting}
                />
            }
        >
            <div className="py-4 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Confirmer la suppression</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Êtes-vous sûr de vouloir supprimer le pays <span className="font-bold text-slate-700">"{data?.libelle}"</span> ?
                        Cette action est irréversible.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
