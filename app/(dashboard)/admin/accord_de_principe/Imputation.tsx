"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PrimaryButton } from "@/components/ui/page-components";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { UserCheck, Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSuccess?: () => void;
}

export function Imputation({ isOpen, onClose, data, onSuccess }: Props) {
    const [instructeurs, setInstructeurs] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInstructeurs = async () => {
            try {
                const res = await apiFetch("/user/liste/instructeur/etablissement");
                if (res?.data) {
                    setInstructeurs(res.data);
                }
            } catch (e) {
                console.error("Error fetching instructeurs", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchInstructeurs();
            setSelectedId(data?.personne?.imputation || "");
        }
    }, [isOpen, data]);

    const handleSave = async () => {
        if (!selectedId) {
            toast.error("Veuillez sélectionner un instructeur");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiFetch(`/etablissement/update/imputation/${data?.personne?.id}`, {
                method: "POST",
                data: {
                    imputation: selectedId,
                    userUpdate: data.userUpdateId // Fallback if needed
                }
            });

            if (res) {
                toast.success("Dossier imputé avec succès");
                onSuccess?.();
                onClose();
            }
        } catch (e) {
            toast.error("Erreur lors de l'imputation");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#0052CC]" />
                    <span>Imputation du Dossier ACP</span>
                </div>
            }
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <PrimaryButton onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer l'imputation"}
                    </PrimaryButton>
                </div>
            }
        >
            <div className="py-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" /></div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 italic mb-4">
                            Sélectionnez l'instructeur qui sera responsable de l'étude de ce dossier d'Accord de Principe.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructeur responsable</label>
                            <select
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                            >
                                <option value="">Choisir un agent...</option>
                                {instructeurs.map((u) => (
                                    <option key={u.id} value={u.id}>{u.username || u.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
