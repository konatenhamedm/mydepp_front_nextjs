"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

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

export function Edite({ isOpen, onClose, onSuccess, data, size = "lg" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        email: "",
        password: "",
        typeUser: "",
        isActive: true
    });

    useEffect(() => {
        if (data && isOpen) {
            setForm({
                nom: data.personne?.nom || "",
                prenoms: data.personne?.prenoms || "",
                email: data.email || "",
                password: "",
                typeUser: data.typeUser || "",
                isActive: data.isActive
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        const payload: any = { ...form };
        if (!payload.password) delete payload.password;

        try {
            await apiFetch(`/user/admin/update/${data.id}`, {
                method: "PUT",
                data: payload
            });
            toast.success("Administrateur mis à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Edit2 className="h-5 w-5" /></div>
                    Modifier l'administrateur
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
                    <div className="space-y-2">
                        <Label>Nouveau mot de passe (optionnel)</Label>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set("password")(e.target.value)} placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
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
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="space-y-0.5">
                        <Label className="text-base">Compte actif</Label>
                        <p className="text-xs text-slate-500">Désactiver pour bloquer l'accès à cet utilisateur</p>
                    </div>
                    <Switch checked={form.isActive} onCheckedChange={v => set("isActive")(v)} />
                </div>
            </form>
        </Modal>
    );
}
