"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { UserCog, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

const TYPE_USERS = [
    { id: "ADMINISTRATEUR", libelle: "ADMINISTRATEUR" },
    { id: "DIRECTEUR", libelle: "DIRECTEUR" },
    { id: "SOUS-DIRECTEUR-PROF", libelle: "SOUS-DIRECTEUR-PROF" },
    { id: "SOUS-DIRECTEUR-ETAB", libelle: "SOUS-DIRECTEUR-ETAB" },
    { id: "INSTRUCTEUR-ETAB", libelle: "INSTRUCTEUR-ETAB" },
    { id: "INSTRUCTEUR-SECOND-ETAB", libelle: "INSTRUCTEUR-SECOND-ETAB" },
    { id: "INSTRUCTEUR-PROF", libelle: "INSTRUCTEUR-PROF" },
    { id: "INSTRUCTEUR-SECOND-PROF", libelle: "INSTRUCTEUR-SECOND-PROF" },
    { id: "COMPTABLE", libelle: "COMPTABLE" },
    { id: "INSPECTEUR-ETAB", libelle: "INSPECTEUR-ETAB" },
];

export function Add({ isOpen, onClose, onSuccess, size = "lg" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        email: "",
        password: "",
        confirmPassword: "",
        typeUser: "",
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (form.password !== form.confirmPassword) {
            return toast.error("Les mots de passe ne correspondent pas");
        }

        if (!form.typeUser) {
            return toast.error("Veuillez sélectionner un type d'utilisateur");
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));

        try {
            await apiFetch("/user/admin/create", {
                method: "POST",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Administrateur créé !");
            setForm({ nom: "", prenoms: "", email: "", password: "", confirmPassword: "", typeUser: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
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
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><UserCog className="h-5 w-5" /></div>
                    Nouvel administrateur
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
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nom <span className="text-red-500">*</span></Label>
                        <Input value={form.nom} onChange={e => set("nom")(e.target.value)} placeholder="Nom" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Prénoms <span className="text-red-500">*</span></Label>
                        <Input value={form.prenoms} onChange={e => set("prenoms")(e.target.value)} placeholder="Prénoms" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input type="email" value={form.email} onChange={e => set("email")(e.target.value)} placeholder="email@exemple.com" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                        <Label>Mot de passe <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set("password")(e.target.value)} placeholder="••••••••" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Confirmer le mot de passe <span className="text-red-500">*</span></Label>
                        <Input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword")(e.target.value)} placeholder="••••••••" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Type d'utilisateur <span className="text-red-500">*</span></Label>
                    <Select value={form.typeUser} onValueChange={set("typeUser")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                            {TYPE_USERS.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </form>
        </Modal>
    );
}
