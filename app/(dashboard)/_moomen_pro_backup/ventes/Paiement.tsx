"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Wallet, Calendar, Coins, Landmark, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any; // The sale object
}

export function Paiement({ isOpen, onClose, onSuccess, data }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        vente_id: data?.id || "",
        caisse_id: "",
        mode_paiement_id: "",
        montant: data?.montant_credit?.toString() || "0",
        date_paiement: new Date().toISOString().split('T')[0],
        description: `Règlement facture ${data?.ref_vente || ""}`
    });

    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);

    useEffect(() => {
        if (data) {
            setForm(prev => ({
                ...prev,
                vente_id: data.id,
                montant: data.montant_credit.toString(),
                description: `Règlement facture ${data.ref_vente}`
            }));
        }
    }, [data]);

    useEffect(() => {
        if (isOpen && magasinId) {
            apiFetch(`/caisses/all/magasin/${magasinId}`).then(res => setCaisses(Array.isArray(res.data) ? res.data : res.data?.data ?? []));
            apiFetch(`/modePaiements/all`).then(res => setModesPaiement(Array.isArray(res.data) ? res.data : res.data?.data ?? []));
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!form.caisse_id) return toast.error("Veuillez sélectionner une caisse");
        if (!form.mode_paiement_id) return toast.error("Veuillez sélectionner un mode de paiement");
        if (parseFloat(form.montant) <= 0) return toast.error("Le montant doit être supérieur à 0");
        if (parseFloat(form.montant) > data.montant_credit) return toast.error("Le montant dépasse le solde dû");

        setIsSubmitting(true);
        try {
            await apiFetch("/ventes/paiements/create", {
                method: "POST",
                data: {
                    ...form,
                    montant: parseFloat(form.montant)
                }
            });

            toast.success("Paiement enregistré avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement du paiement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Encaisser un paiement</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Client: {data.client?.nom || "Anonyme"}</p>
                    </div>
                </div>
            }
            size="lg"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Traitement..." : "Valider l'encaissement"}
                    isLoading={isSubmitting}
                />
            }
        >
            <div className="space-y-8 py-2 animate-in fade-in zoom-in-95 duration-300">

                {/* Sale Info Summary */}
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052cc]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Référence Facture</span>
                            <p className="text-lg font-black tracking-tight">{data.ref_vente}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-[10px] font-bold text-green-400/80 uppercase">Montant Initial: {data.montant_ttc?.toLocaleString()} XOF</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Reste à recouvrer</span>
                            <p className="text-3xl font-black text-white">{data.montant_credit?.toLocaleString()} <span className="text-xs font-serif italic text-white/40">XOF</span></p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Coins className="w-3.5 h-3.5" /> Montant à verser
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={form.montant}
                                    onChange={set("montant")}
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#0052cc]/5 font-black text-lg text-[#0052cc] px-12"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                    <Info className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date du versement
                            </Label>
                            <Input type="date" value={form.date_paiement} onChange={set("date_paiement")} className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5" /> Mode de Paiement
                            </Label>
                            <select
                                value={form.mode_paiement_id}
                                onChange={set("mode_paiement_id")}
                                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none"
                            >
                                <option value="">Choisir un mode...</option>
                                {modesPaiement.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 group">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5" /> Tracer vers la Caisse
                            </Label>
                            <select
                                value={form.caisse_id}
                                onChange={set("caisse_id")}
                                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none"
                            >
                                <option value="">Choisir une caisse...</option>
                                {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle} — Solde: {c.solde?.toLocaleString()}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note descriptive</Label>
                        <Input value={form.description} onChange={set("description")} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium" />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-900 leading-relaxed font-bold">
                            L'encaissement mettra à jour le solde de la caisse sélectionnée et réduira le crédit client associé à cette vente. Cette action est irréversible.
                        </p>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
