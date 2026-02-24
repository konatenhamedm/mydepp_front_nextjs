"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Delete({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/personnels/${data.id}/delete`, { method: "DELETE" });
      toast.success("Employé supprimé !"); onSuccess(); onClose();
    } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
          Supprimer l'employé
        </div>
      }
      variant="danger"
      size={size}
      footer={
        <ModalFooterButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={isSubmitting ? "Suppression..." : "Confirmer"}
          isLoading={isSubmitting}
          confirmVariant="destructive"
        />
      }
    >
      <div className="py-2">
        <p className="text-slate-600">
          Voulez-vous supprimer l'employé <span className="font-bold text-red-600">{data?.nom} {data?.prenoms}</span> ?
        </p>
        <p className="text-sm text-slate-400 mt-2 italic">Cette action est irréversible.</p>
      </div>
    </Modal>
  );
}
