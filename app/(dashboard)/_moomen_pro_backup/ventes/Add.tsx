"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import {
    ShoppingCart, User, Calendar, Tag, Info, ChevronRight, ChevronLeft,
    Plus, Trash2, Package, Search, Calculator, Wallet, CheckCircle2,
    AlertCircle, Store, Receipt, Coins, ShieldCheck, ArrowRight, UserPlus, CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function Add({ isOpen, onClose, onSuccess }: Props) {
    const { magasinId } = useMagasin();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        date_vente: new Date().toISOString().split('T')[0],
        client_id: "",
        user_vendeur_id: "",
        magasin_id: magasinId,
        is_credit: false,
        date_limit_credit: "",
        commentaire: "",
        commentaire_recu: "",
        lignes_vente_produits: [] as any[], // { produit_id, quantite, prix, montant_remise, detail: any }
        lignes_taxe_ventes: [] as number[], // IDs of taxes
        montant_remise: 0,
        paiements: [] as any[], // { montant, mode_paiement_id, caisse_id, date_paiement, description }
    });

    // Master/Support Data
    const [clients, setClients] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);
    const [personnels, setPersonnels] = useState<any[]>([]);

    // Selection helper for step 2
    const [articleSearch, setArticleSearch] = useState("");
    const [selectedArticleId, setSelectedArticleId] = useState("");
    const [articleQty, setArticleQty] = useState(1);
    const [articlePrice, setArticlePrice] = useState(0);

    // Fetch initial data
    useEffect(() => {
        if (isOpen && magasinId) {
            const fetchAll = async () => {
                const [c, t, a, cs, mp, p] = await Promise.all([
                    apiFetch(`/clients/all/magasin/${magasinId}`),
                    apiFetch(`/taxes/all/magasin/${magasinId}`),
                    apiFetch(`/articles/all/magasin/${magasinId}`),
                    apiFetch(`/caisses/all/magasin/${magasinId}`),
                    apiFetch(`/modePaiements/all`),
                    apiFetch(`/personnels/all/magasin/${magasinId}`)
                ]);
                setClients(Array.isArray(c.data) ? c.data : c.data?.data ?? []);
                setTaxes(Array.isArray(t.data) ? t.data : t.data?.data ?? []);
                setArticles(Array.isArray(a.data) ? a.data : a.data?.data ?? []);
                setCaisses(Array.isArray(cs.data) ? cs.data : cs.data?.data ?? []);
                setModesPaiement(Array.isArray(mp.data) ? mp.data : mp.data?.data ?? []);
                setPersonnels(Array.isArray(p.data) ? p.data : p.data?.data ?? []);
            };
            fetchAll();
        }
    }, [isOpen, magasinId]);

    // Financial calculations
    const totals = useMemo(() => {
        const totalHT = form.lignes_vente_produits.reduce((acc, l) => acc + (l.quantite * (l.prix - (l.montant_remise || 0))), 0);
        const totalHTAvecRemise = Math.max(0, totalHT - form.montant_remise);

        // Calculate taxes
        let totalTaxe = 0;
        form.lignes_taxe_ventes.forEach(taxId => {
            const tax = taxes.find(t => t.id === taxId);
            if (tax) {
                totalTaxe += (tax.valeur / 100) * totalHTAvecRemise;
            }
        });

        const totalTTC = totalHTAvecRemise + totalTaxe;
        const totalRegle = form.paiements.reduce((acc, p) => acc + parseFloat(p.montant || 0), 0);
        const resteAPayer = Math.max(0, totalTTC - totalRegle);

        return { totalHT, totalHTAvecRemise, totalTaxe, totalTTC, totalRegle, resteAPayer };
    }, [form.lignes_vente_produits, form.montant_remise, form.lignes_taxe_ventes, form.paiements, taxes]);

    const handleAddArticle = () => {
        const article = articles.find(a => a.id === parseInt(selectedArticleId));
        if (!article) return;

        // Check stock
        if (article.type === "article" && article.stock < articleQty && !article.drop_shipping) {
            toast.error(`Stock insuffisant. Disponible: ${article.stock}`);
            return;
        }

        // Add to list
        const newItem = {
            produit_id: article.id,
            quantite: articleQty,
            prix: articlePrice || article.prix_vente,
            montant_remise: 0,
            detail: article
        };

        setForm(f => ({
            ...f,
            lignes_vente_produits: [...f.lignes_vente_produits, newItem]
        }));

        setSelectedArticleId("");
        setArticleQty(1);
        setArticlePrice(0);
    };

    const handleRemoveArticle = (idx: number) => {
        setForm(f => ({
            ...f,
            lignes_vente_produits: f.lignes_vente_produits.filter((_, i) => i !== idx)
        }));
    };

    const handleAddPaiement = () => {
        if (totals.resteAPayer <= 0) return;

        const newPaiement = {
            montant: totals.resteAPayer.toString(),
            mode_paiement_id: form.paiements.length > 0 ? form.paiements[0].mode_paiement_id : "",
            caisse_id: form.paiements.length > 0 ? form.paiements[0].caisse_id : "",
            date_paiement: form.date_vente,
            description: "Paiement vente"
        };

        setForm(f => ({
            ...f,
            paiements: [...f.paiements, newPaiement]
        }));
    };

    const updatePaiement = (idx: number, key: string, val: any) => {
        const newPaiements = [...form.paiements];
        newPaiements[idx][key] = val;
        setForm(f => ({ ...f, paiements: newPaiements }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!form.date_vente) return toast.error("La date est obligatoire");
            if (form.is_credit && !form.client_id) return toast.error("Le client est obligatoire pour une vente à crédit");
            setStep(2);
        } else if (step === 2) {
            if (form.lignes_vente_produits.length === 0) return toast.error("Veuillez ajouter au moins un article");
            setStep(3);
        } else if (step === 3) {
            if (form.montant_remise > totals.totalHT) return toast.error("La remise ne peut pas dépasser le total HT");

            // Auto-create payment if comptant and no payments yet
            if (!form.is_credit && form.paiements.length === 0) {
                // We'll leave it to step 4 interface but we can prepopulate first payment
            }
            setStep(4);
        } else if (step === 4) {
            if (form.is_credit) {
                if (totals.totalRegle >= totals.totalTTC) return toast.error("Le montant réglé doit être inférieur au TTC pour un crédit");
            } else {
                if (totals.totalRegle < totals.totalTTC) return toast.error("Le montant réglé doit couvrir le TTC pour une vente au comptant");
            }
            setStep(5);
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                montant_ht: totals.totalHT,
                montant_ttc: totals.totalTTC,
                montant_regle: totals.totalRegle,
                montant_credit: Math.max(0, totals.totalTTC - totals.totalRegle),
                magasin_id: magasinId
            };

            await apiFetch("/ventes/create", {
                method: "POST",
                data: payload
            });

            toast.success("Vente enregistrée avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création de la vente");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="flex justify-between items-center mb-10 px-4">
            {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 relative">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 z-10 ${step >= s ? "bg-[#0052cc] text-white shadow-xl shadow-blue-100" : "bg-slate-100 text-slate-400"
                        }`}>
                        {step > s ? <CheckCircle2 className="w-5 h-5 text-white" /> : s}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? "text-[#0052cc]" : "text-slate-400"}`}>
                        {s === 1 ? "Infos" : s === 2 ? "Articles" : s === 3 ? "Remise" : s === 4 ? "Règlement" : "Récap"}
                    </span>
                    {s < 5 && (
                        <div className={`absolute top-5 left-10 w-[calc(100vw/5-40px)] h-0.5 max-w-[120px] transition-all duration-300 ${step > s ? "bg-[#0052cc]" : "bg-slate-100"
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                        <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvelle Vente</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Étape {step} sur 5</p>
                    </div>
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={step === 1 ? onClose : prevStep} className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-6">
                        {step === 1 ? "Abandonner" : "Précédent"}
                    </Button>
                    {step < 5 ? (
                        <Button onClick={nextStep} className="bg-[#0052cc] hover:bg-[#0041a8] rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-blue-100 flex items-center gap-2">
                            Suivant <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-green-100 flex items-center gap-2">
                            {isSubmitting ? "Validation..." : "Confirmer la Vente"} <CheckCircle2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            }
        >
            <div className="px-2 pb-4">
                {renderStepIndicators()}

                {/* STEP 1: GENERAL INFO */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Date de l'opération
                                </Label>
                                <Input type="date" value={form.date_vente} onChange={(e) => setForm({ ...form, date_vente: e.target.value })} className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Client {form.is_credit && <span className="text-red-500">*</span>}
                                </Label>
                                <div className="flex gap-2">
                                    <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="flex-1 h-14 rounded-2xl font-bold bg-slate-50 border border-slate-100 px-4 text-slate-700 outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none">
                                        <option value="">Consommateur occasionnel (Anonyme)</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                                    </select>
                                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-dashed border-2 border-slate-200 text-slate-400 hover:text-[#0052cc] hover:border-[#0052cc]">
                                        <UserPlus className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0052cc] flex items-center justify-center text-white shadow-lg">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Vente à Crédit ?</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Le client paiera plus tard</p>
                                    </div>
                                </div>
                                <Checkbox checked={form.is_credit} onCheckedChange={(v) => setForm({ ...form, is_credit: !!v })} className="w-6 h-6 rounded-lg border-2 border-[#0052cc]" />
                            </div>

                            {form.is_credit && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest">Échéance de règlement</Label>
                                        <Input type="date" value={form.date_limit_credit} onChange={(e) => setForm({ ...form, date_limit_credit: e.target.value })} className="h-12 rounded-xl border-blue-200" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Taxes Applicables</Label>
                            <div className="flex flex-wrap gap-2">
                                {taxes.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            const active = form.lignes_taxe_ventes.includes(t.id);
                                            setForm({
                                                ...form,
                                                lignes_taxe_ventes: active ? form.lignes_taxe_ventes.filter(id => id !== t.id) : [...form.lignes_taxe_ventes, t.id]
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${form.lignes_taxe_ventes.includes(t.id)
                                            ? "bg-[#0052cc] border-[#0052cc] text-white shadow-md scale-105"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                            }`}
                                    >
                                        {t.libelle} ({t.valeur}%)
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: ARTICLES */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Selector Area */}
                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Produit ou Service</Label>
                                <div className="relative">
                                    <select
                                        value={selectedArticleId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedArticleId(id);
                                            const art = articles.find(a => a.id === parseInt(id));
                                            if (art) setArticlePrice(art.prix_vente);
                                        }}
                                        className="w-full h-12 rounded-xl bg-white border border-slate-200 px-10 text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-[#0052cc]/5"
                                    >
                                        <option value="">Sélectionner un article...</option>
                                        {articles.map(a => (
                                            <option key={a.id} value={a.id} disabled={a.type === "article" && a.stock <= 0 && !a.drop_shipping} className={a.type === "article" && a.stock <= 0 ? "text-slate-300" : ""}>
                                                {a.libelle} — {a.prix_vente.toLocaleString()} {a.type === "article" ? `(${a.stock} en stock)` : "(Service)"}
                                            </option>
                                        ))}
                                    </select>
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="w-full md:w-24 space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qté</Label>
                                <Input type="number" min="1" value={articleQty} onChange={(e) => setArticleQty(parseInt(e.target.value) || 1)} className="h-12 rounded-xl font-black text-center" />
                            </div>
                            <Button onClick={handleAddArticle} disabled={!selectedArticleId} className="h-12 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] px-6">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* List Area */}
                        <div className="border border-slate-100 rounded-3xl overflow-hidden min-h-[300px] flex flex-col bg-white">
                            <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Panier ({form.lignes_vente_produits.length} items)</span>
                                <span className="text-xs font-black text-slate-700">Total HT: {totals.totalHT.toLocaleString()}</span>
                            </div>

                            {form.lignes_vente_produits.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-10 gap-3">
                                    <Package className="w-12 h-12 opacity-20" />
                                    <p className="text-sm font-bold">Le panier est encore vide</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {form.lignes_vente_produits.map((item, idx) => (
                                        <div key={idx} className="p-4 px-6 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0052cc] font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-sm font-black text-slate-800">{item.detail?.libelle}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.detail?.type === "article" ? "Article Stockable" : "Service"}</p>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-700">{item.prix.toLocaleString()} x {item.quantite}</p>
                                                    <p className="text-[10px] text-[#0052cc] font-black uppercase">{(item.prix * item.quantite).toLocaleString()}</p>
                                                </div>
                                                <button onClick={() => handleRemoveArticle(idx)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: REMISE */}
                {step === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 py-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-100/50">
                                <Calculator className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Appliquer une remise globale</h3>
                                <p className="text-sm text-slate-400 font-medium">Réduisez le montant total de la facture</p>
                            </div>
                        </div>

                        <div className="max-w-md mx-auto w-full space-y-6 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] w-full text-center block">Montant de la réduction</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={form.montant_remise}
                                        onChange={(e) => setForm({ ...form, montant_remise: parseFloat(e.target.value) || 0 })}
                                        className="h-20 rounded-3xl text-center text-3xl font-black text-[#0052cc] border-2 focus:border-[#0052cc] bg-white shadow-xl shadow-blue-100/20"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-serif text-xl italic">XOF</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Initial</span>
                                    <span className="text-sm font-bold text-slate-700">{totals.totalHT.toLocaleString()}</span>
                                </div>
                                <div className={`p-4 rounded-2xl border flex flex-col items-center transition-colors ${form.montant_remise > 0 ? "bg-[#0052cc]/5 border-[#0052cc]/20" : "bg-white border-slate-100"}`}>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Net après remise</span>
                                    <span className="text-sm font-bold text-[#0052cc]">{totals.totalHTAvecRemise.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: REGLEMENT */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-[#0052cc] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <Wallet className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight">{form.is_credit ? "Règlement Partiel (Facultatif)" : "Encaissement Total"}</h4>
                                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{form.is_credit ? "Vente à crédit : Le solde sera mis en compte" : "Vente au comptant : Le montant total doit être réglé"}</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Net à Percevoir (TTC)</p>
                                    <p className="text-4xl font-black">{totals.totalTTC.toLocaleString()} <span className="text-sm font-serif italic text-white/50">XOF</span></p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span>Progression du règlement</span>
                                    <span>{Math.round((totals.totalRegle / totals.totalTTC) * 100) || 0}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-500" style={{ width: `${Math.min(100, (totals.totalRegle / totals.totalTTC) * 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Liste des encaissements</h5>
                            <Button onClick={handleAddPaiement} disabled={totals.resteAPayer <= 0} className="h-9 rounded-xl bg-slate-900 hover:bg-black text-[10px] font-black uppercase tracking-widest gap-2">
                                <Plus className="w-3.5 h-3.5" /> Ajouter un paiement
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {form.paiements.length === 0 ? (
                                <div className="h-32 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 gap-2">
                                    <Coins className="w-8 h-8 opacity-20" />
                                    <p className="text-xs font-bold font-italic">Aucun paiement enregistré pour l'instant</p>
                                </div>
                            ) : (
                                form.paiements.map((p, idx) => (
                                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-sm animate-in slide-in-from-left-2 duration-200">
                                        <div className="md:col-span-3 space-y-1.5">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant</Label>
                                            <Input
                                                type="number"
                                                value={p.montant}
                                                onChange={(e) => updatePaiement(idx, "montant", e.target.value)}
                                                className="h-10 rounded-xl font-black text-[#0052cc]"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-1.5">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode</Label>
                                            <select
                                                value={p.mode_paiement_id}
                                                onChange={(e) => updatePaiement(idx, "mode_paiement_id", e.target.value)}
                                                className="w-full h-10 rounded-xl border border-slate-200 text-xs font-bold px-3 outline-none focus:ring-2 focus:ring-[#0052cc]/10"
                                            >
                                                <option value="">Sélectionner...</option>
                                                {modesPaiement.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-4 space-y-1.5">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caisse</Label>
                                            <select
                                                value={p.caisse_id}
                                                onChange={(e) => updatePaiement(idx, "caisse_id", e.target.value)}
                                                className="w-full h-10 rounded-xl border border-slate-200 text-xs font-bold px-3 outline-none focus:ring-2 focus:ring-[#0052cc]/10"
                                            >
                                                <option value="">Sélectionner...</option>
                                                {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-0.5">
                                            <button onClick={() => setForm({ ...form, paiements: form.paiements.filter((_, i) => i !== idx) })} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#0052cc]" /> Reste à payer
                            </span>
                            <span className={`text-xl font-black ${totals.resteAPayer > 0 ? "text-red-500" : "text-green-600"}`}>
                                {totals.resteAPayer.toLocaleString()} XOF
                            </span>
                        </div>
                    </div>
                )}

                {/* STEP 5: RECAPITULATIF */}
                {step === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Summary Details */}
                            <div className="md:col-span-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <Receipt className="w-5 h-5 text-[#0052cc]" />
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Récapitulatif de vente</h4>
                                    </div>

                                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-black text-slate-400 uppercase tracking-widest">Article</th>
                                                    <th className="px-4 py-3 text-center font-black text-slate-400 uppercase tracking-widest">Prix</th>
                                                    <th className="px-4 py-3 text-center font-black text-slate-400 uppercase tracking-widest">Qté</th>
                                                    <th className="px-4 py-3 text-right font-black text-slate-400 uppercase tracking-widest">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {form.lignes_vente_produits.map((l, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-3 font-bold text-slate-700">{l.detail?.libelle}</td>
                                                        <td className="px-4 py-3 text-center text-slate-500">{l.prix.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-center font-black text-slate-700">{l.quantite}</td>
                                                        <td className="px-4 py-3 text-right font-black text-[#0052cc]">{(l.prix * l.quantite).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Vendeur</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-bold text-slate-600">Client: <span className="text-[#0052cc]">{clients.find(c => String(c.id) === form.client_id)?.nom || "Client Anonyme"}</span></p>
                                            <p className="text-xs font-bold text-slate-600">Vendeur: <span className="text-slate-800">Administrateur</span></p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                                            <Store className="w-4 h-4 text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localisation</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600">{form.date_vente ? new Date(form.date_vente).toLocaleDateString() : '—'}</p>
                                        <Badge className={`${form.is_credit ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-green-50 text-green-600 border-green-100"} font-black uppercase text-[8px]`}>
                                            Vente {form.is_credit ? "à Crédit" : "au Comptant"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Totals Block */}
                            <div className="md:col-span-4 space-y-6">
                                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 border-b border-white/10 pb-3">Finalisation Financière</h5>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-white/40 uppercase">Total HT</span>
                                            <span className="text-sm font-bold">{totals.totalHT.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-white/40 uppercase">Remise Globale</span>
                                            <span className="text-sm font-bold text-amber-400">-{form.montant_remise.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                            <span className="text-[10px] font-bold text-white/40 uppercase">Total Taxes</span>
                                            <span className="text-sm font-bold">+{totals.totalTaxe.toLocaleString()}</span>
                                        </div>

                                        <div className="pt-2 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest bg-white rounded-full px-3 py-1">Net à Payer</span>
                                            <span className="text-3xl font-black">{totals.totalTTC.toLocaleString()} <span className="text-xs font-serif italic text-white/40">XOF</span></span>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs font-bold">
                                            <span className="text-green-400">Paiement: {totals.totalRegle.toLocaleString()}</span>
                                            <span className={totals.resteAPayer > 0 ? "text-orange-400" : "text-green-400"}>Solde: {totals.resteAPayer.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex gap-3 items-start">
                                    <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-[10px] text-green-800 leading-relaxed font-bold">
                                        Toutes les règles de gestion ont été vérifiées. En validant, vous générez une facture finale et déduisez le stock des articles vendus.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Commentaires (Sur le reçu)</Label>
                            <Textarea
                                value={form.commentaire_recu}
                                onChange={(e) => setForm({ ...form, commentaire_recu: e.target.value })}
                                placeholder="Merci de votre fidélité ! A bientôt."
                                className="rounded-2xl bg-slate-50 border-slate-100 focus:bg-white resize-none text-sm font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
