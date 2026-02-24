"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import {
    ClipboardList, User, Calendar, Tag, Info, ChevronRight, ChevronLeft,
    Plus, Trash2, Package, Search, Calculator, Wallet, CheckCircle2,
    AlertCircle, Store, Receipt, Coins, ShieldCheck, Truck, UserPlus,
    MapPin, Phone
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
        date_commande: new Date().toISOString().slice(0, 16).replace('T', ' '),
        caisse_id: "",
        commentaire: "",
        commentaire_recu: "",
        magasin_id: magasinId,
        client_id: "",
        date_livraison: new Date().toISOString().split('T')[0],
        livreur_id: 0,
        nom_livreur: "",
        tel_livreur: "",
        montant_regle: 0,
        montant_ht: 0,
        montant_ttc: 0,
        montant_remise: 0,
        lieu_livraison: "",
        mode_paiement_id: "",
        lignes_vente_produits: [] as any[], // { produit_id, quantite, prix, montant_remise, detail: any }
        lignes_taxe_ventes: [] as number[], // IDs of taxes
        paiements: [] as any[], // We still handle payments if partial at creation
    });

    // Master/Support Data
    const [clients, setClients] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);
    const [livreurs, setLivreurs] = useState<any[]>([]); // Using personnel for now as livreurs if available

    // Selection helper for step 2
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
                setLivreurs(Array.isArray(p.data) ? p.data : p.data?.data ?? []);
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
        const totalRegle = form.montant_regle;
        const resteAPayer = Math.max(0, totalTTC - totalRegle);

        return { totalHT, totalHTAvecRemise, totalTaxe, totalTTC, totalRegle, resteAPayer };
    }, [form.lignes_vente_produits, form.montant_remise, form.lignes_taxe_ventes, form.montant_regle, taxes]);

    const handleAddArticle = () => {
        const article = articles.find(a => a.id === parseInt(selectedArticleId));
        if (!article) return;

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
        setForm(f => ({ ...f, lignes_vente_produits: f.lignes_vente_produits.filter((_, i) => i !== idx) }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!form.client_id) return toast.error("Le client est obligatoire");
            if (!form.date_commande) return toast.error("La date de commande est obligatoire");
            setStep(2);
        } else if (step === 2) {
            if (form.lignes_vente_produits.length === 0) return toast.error("Veuillez ajouter au moins un produit");
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            if (!form.lieu_livraison) return toast.error("Le lieu de livraison est obligatoire");
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
                montant_remise: form.montant_remise,
                magasin_id: magasinId
            };

            await apiFetch("/commandes/create", { method: "POST", data: payload });

            toast.success("Commande créée avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création de la commande");
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
                        {s === 1 ? "Général" : s === 2 ? "Panier" : s === 3 ? "Taxes/Remise" : s === 4 ? "Livraison" : "Validation"}
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
                        <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvelle Commande</h2>
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
                            {isSubmitting ? "Création..." : "Confirmer la Commande"} <CheckCircle2 className="w-4 h-4" />
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
                                    <Calendar className="w-3.5 h-3.5" /> Date de commande
                                </Label>
                                <Input type="datetime-local" value={form.date_commande.replace(' ', 'T')} onChange={(e) => setForm({ ...form, date_commande: e.target.value.replace('T', ' ') })} className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Client <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="flex-1 h-14 rounded-2xl font-bold bg-slate-50 border border-slate-100 px-4 text-slate-700 outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none">
                                        <option value="">Sélectionner un client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                                    </select>
                                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-dashed border-2 border-slate-200 text-slate-400 hover:text-[#0052cc] hover:border-[#0052cc]">
                                        <UserPlus className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Caisse & Paiement initial</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <select value={form.caisse_id} onChange={(e) => setForm({ ...form, caisse_id: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold">
                                        <option value="">Sélectionner une caisse...</option>
                                        {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <select value={form.mode_paiement_id} onChange={(e) => setForm({ ...form, mode_paiement_id: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold">
                                        <option value="">Moyen de paiement...</option>
                                        {modesPaiement.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: PANIER */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Produit / Service</Label>
                                <div className="relative">
                                    <select
                                        value={selectedArticleId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedArticleId(id);
                                            const art = articles.find(a => a.id === parseInt(id));
                                            if (art) setArticlePrice(art.prix_vente);
                                        }}
                                        className="w-full h-12 rounded-xl bg-white border border-slate-200 px-10 text-sm font-bold outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none"
                                    >
                                        <option value="">Choisir un article...</option>
                                        {articles.map(a => (
                                            <option key={a.id} value={a.id}>{a.libelle} — {a.prix_vente.toLocaleString()} XOF</option>
                                        ))}
                                    </select>
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="w-full md:w-24 space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qté</Label>
                                <Input type="number" min="1" value={articleQty} onChange={(e) => setArticleQty(parseInt(e.target.value) || 1)} className="h-12 rounded-xl font-black text-center" />
                            </div>
                            <Button onClick={handleAddArticle} disabled={!selectedArticleId} className="h-12 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] px-6 text-white">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="border border-slate-100 rounded-3xl overflow-hidden min-h-[250px] bg-white">
                            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Panier ({form.lignes_vente_produits.length} produits)</span>
                                <span className="text-xs font-black text-slate-700 uppercase">Total HT: {totals.totalHT.toLocaleString()}</span>
                            </div>
                            {form.lignes_vente_produits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                                    <Package className="w-12 h-12 opacity-20 mb-2" />
                                    <p className="text-xs font-bold">Aucun produit ajouté</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {form.lignes_vente_produits.map((item, idx) => (
                                        <div key={idx} className="p-4 px-6 flex items-center gap-4 group">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052cc] flex items-center justify-center text-xs font-black">{idx + 1}</div>
                                            <div className="flex-1">
                                                <h5 className="text-sm font-bold text-slate-800">{item.detail?.libelle}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold">{item.prix.toLocaleString()} XOF x {item.quantite}</p>
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{(item.prix * item.quantite).toLocaleString()}</span>
                                            <button onClick={() => handleRemoveArticle(idx)} className="p-2 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: TAXES & REMISE */}
                {step === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 py-4">
                        <div className="max-w-md mx-auto space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center block">Taxes Applicables</Label>
                                <div className="flex flex-wrap justify-center gap-2">
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
                                            className={`px-4 py-2 rounded-xl border text-[10px] font-black tracking-widest uppercase transition-all ${form.lignes_taxe_ventes.includes(t.id)
                                                    ? "bg-[#0052cc] border-[#0052cc] text-white shadow-lg"
                                                    : "bg-white border-slate-200 text-slate-400"
                                                }`}
                                        >
                                            {t.libelle} ({t.valeur}%)
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Remise globale (XOF)</Label>
                                <Input
                                    type="number"
                                    value={form.montant_remise}
                                    onChange={(e) => setForm({ ...form, montant_remise: parseFloat(e.target.value) || 0 })}
                                    className="h-16 rounded-2xl text-center text-2xl font-black text-[#0052cc] border-2 focus:border-[#0052cc] bg-white shadow-xl shadow-blue-100/10"
                                />
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Initial</p><p className="text-sm font-bold text-slate-600">{totals.totalHT.toLocaleString()}</p></div>
                                    <div className="text-center border-l"><p className="text-[9px] font-black text-[#0052cc] uppercase tracking-widest">Net Final</p><p className="text-sm font-bold text-[#0052cc]">{totals.totalTTC.toLocaleString()}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: LIVRAISON */}
                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-[#0052cc] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl mb-8">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative z-10 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"><Truck className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="text-lg font-black tracking-tight">Configuration de la livraison</h4>
                                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Indiquez où et quand livrer cette commande</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" /> Lieu de livraison <span className="text-red-500">*</span>
                                </Label>
                                <Input value={form.lieu_livraison} onChange={(e) => setForm({ ...form, lieu_livraison: e.target.value })} placeholder="Adresse complète..." className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Date de livraison prévue
                                </Label>
                                <Input type="date" value={form.date_livraison} onChange={(e) => setForm({ ...form, date_livraison: e.target.value })} className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Livreur interne</Label>
                                <select value={form.livreur_id} onChange={(e) => setForm({ ...form, livreur_id: parseInt(e.target.value) || 0 })} className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm font-bold">
                                    <option value="0">Personnel de l'équipe...</option>
                                    {livreurs.map(l => <option key={l.id} value={l.id}>{l.nom} {l.prenoms}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom Livreur externe</Label>
                                <Input value={form.nom_livreur} onChange={(e) => setForm({ ...form, nom_livreur: e.target.value })} placeholder="Si externe..." className="h-12 rounded-xl bg-slate-50 border-slate-100" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tel. Livreur</Label>
                                <div className="relative">
                                    <Input value={form.tel_livreur} onChange={(e) => setForm({ ...form, tel_livreur: e.target.value })} className="h-12 rounded-xl bg-slate-50 border-slate-100 pl-10" />
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: RECAP & VALIDATION */}
                {step === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-12 space-y-6">
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-[#0052cc] text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest">Commande Provisoire</Badge>
                                                <Badge className="bg-white/10 text-white border-white/20 font-black px-4 py-1 uppercase text-[10px] tracking-widest">En attente de livraison</Badge>
                                            </div>
                                            <h3 className="text-5xl font-black tracking-tighter">{totals.totalTTC.toLocaleString()} <span className="text-xl font-serif italic text-white/30 tracking-normal">XOF</span></h3>
                                            <div className="flex flex-wrap gap-8 pt-2">
                                                <div><p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Items</p><p className="text-sm font-bold">{form.lignes_vente_produits.length} Produits</p></div>
                                                <div className="border-l border-white/10 pl-8"><p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Client</p><p className="text-sm font-bold">{clients.find(c => String(c.id) === form.client_id)?.nom || "Anonyme"}</p></div>
                                                <div className="border-l border-white/10 pl-8"><p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Destinations</p><p className="text-sm font-bold truncate max-w-[200px]">{form.lieu_livraison}</p></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] w-full md:w-auto min-w-[240px] space-y-4">
                                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-white/40 uppercase">Total Brut</span><span className="font-bold text-white">{totals.totalHT.toLocaleString()}</span></div>
                                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-white/40 uppercase">Taxes incluses</span><span className="font-bold text-white">+{totals.totalTaxe.toLocaleString()}</span></div>
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10"><span className="text-[10px] font-bold text-white/40 uppercase">Remise</span><span className="font-bold text-amber-400">-{form.montant_remise.toLocaleString()}</span></div>

                                            <div className="space-y-1.5 pt-2">
                                                <Label className="text-[9px] font-black text-[#0052cc] uppercase tracking-widest bg-white rounded-full px-3 py-0.5 inline-block">Acompte à l'engagement</Label>
                                                <Input type="number" value={form.montant_regle} onChange={(e) => setForm({ ...form, montant_regle: parseFloat(e.target.value) || 0 })} className="h-12 bg-white/10 border-white/20 text-white font-black text-xl rounded-2xl focus:bg-white/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observations Internes</span>
                                        </div>
                                        <Textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} placeholder="Notes pour l'équipe..." className="rounded-2xl bg-slate-50 border-slate-100 min-h-[100px] text-xs font-medium" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2">
                                            <Receipt className="w-4 h-4 text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes sur le reçu client</span>
                                        </div>
                                        <Textarea value={form.commentaire_recu} onChange={(e) => setForm({ ...form, commentaire_recu: e.target.value })} placeholder="Merci de votre commande !" className="rounded-2xl bg-slate-50 border-slate-100 min-h-[100px] text-xs font-medium" />
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100 flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center text-blue-500 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                                    <p className="text-[10px] text-blue-900 leading-relaxed font-bold uppercase tracking-wide">
                                        En confirmant cette commande, vous réservez les stocks et préparez le circuit de livraison. Un reçu partiel sera généré si un acompte est versé.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
