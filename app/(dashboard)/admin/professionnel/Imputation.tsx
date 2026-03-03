"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/axios";
import { useSession } from "next-auth/react";

interface Props { isOpen: boolean; onClose: () => void; data: any; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Imputation({ isOpen, onClose, data, onSuccess, size = "md" }: Props) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [selectedInstructor, setSelectedInstructor] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setIsLoadingInstructors(true);
            apiFetch("/user/liste/instructeur/etablissement")
                .then((res) => {
                    setInstructors(res.data?.data || res.data || []);
                    setIsLoadingInstructors(false);
                })
                .catch(() => {
                    toast.error("Impossible de charger les instructeurs");
                    setIsLoadingInstructors(false);
                });

            if (data?.personne?.imputation) {
                setSelectedInstructor(String(data.personne.imputation));
            } else {
                setSelectedInstructor("");
            }
        }
    }, [isOpen, data]);

    const handleSubmit = async () => {
        if (!selectedInstructor) {
            toast.error("Veuillez sélectionner un instructeur.");
            return;
        }

        setIsSubmitting(true);
        try {
            const targetId = data.personne?.id || data.id;
            await apiFetch(`/professionnel/update/imputation/${targetId}`, {
                method: "POST",
                data: {
                    imputation: parseInt(selectedInstructor, 10),
                    userUpdate: currentUserId
                }
            });
            toast.success("Dossier imputé avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'imputation");
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
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><UserPlus className="h-5 w-5" /></div>
                    Imputer le dossier
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Imputation..." : "Valider l'imputation"}
                    isLoading={isSubmitting}
                />
            }
        >
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-black text-slate-900">Sélectionner l'instructeur <span className="text-red-500">*</span></Label>
                    <Select value={selectedInstructor} onValueChange={setSelectedInstructor} disabled={isLoadingInstructors}>
                        <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200">
                            <SelectValue placeholder={isLoadingInstructors ? "Chargement..." : "Choisir un instructeur"} />
                        </SelectTrigger>
                        <SelectContent>
                            {instructors.map(inst => (
                                <SelectItem key={inst.id} value={String(inst.id)}>
                                    {inst.nom} {inst.prenoms} ({inst.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                    <p className="text-xs text-slate-900 font-bold leading-relaxed">
                        L'imputation affectera ce dossier à l'instructeur sélectionné pour analyse et suite du traitement. L'instructeur sera notifié dans son espace.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
