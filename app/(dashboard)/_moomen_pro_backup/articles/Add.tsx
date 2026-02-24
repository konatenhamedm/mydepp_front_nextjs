"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Package, ShoppingBag, Box } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "lg" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [achatType, setAchatType] = useState<"detail" | "gros">("detail");

    const [form, setForm] = useState({
        libelle: "",
        prix_vente: "",
        prix_achat: "",
        prix_pack: "",
        qte_pack: "",
        stock: "",
        seuil: "",
        categorie_id: "",
        unite_id: ""
    });

    useEffect(() => {
        if (isOpen && magasinId) {
            apiFetch(`/categorie_produit_services/all/magasin/${magasinId}`).then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
            apiFetch(`/unites/all/magasin/${magasinId}`).then(res => setUnites(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;

        let finalPrixAchat = parseFloat(form.prix_achat) || 0;
        if (achatType === "gros") {
            const pPack = parseFloat(form.prix_pack) || 0;
            const qPack = parseFloat(form.qte_pack) || 0;
            if (qPack > 0) finalPrixAchat = pPack / qPack;
        }

        setIsSubmitting(true);
        try {
            await apiFetch("/articles/create", {
                method: "POST",
                data: {
                    ...form,
                    magasin_id: magasinId,
                    prix_vente: parseFloat(form.prix_vente) || 0,
                    prix_achat: finalPrixAchat,
                    stock: parseFloat(form.stock) || 0,
                    seuil: parseFloat(form.seuil) || 0,
                    categorie_id: parseInt(form.categorie_id) || null,
                    unite_id: parseInt(form.unite_id) || null
                }
            });
            toast.success("Article créé !");
            setForm({ libelle: "", prix_vente: "", prix_achat: "", prix_pack: "", qte_pack: "", stock: "", seuil: "", categorie_id: "", unite_id: "" });
            onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Package className="h-5 w-5" /></div>
                    Nouvel article
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
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 py-2">
                {/* Section Libellé */}
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                        Désignation de l'article <span className="text-red-500">*</span>
                    </Label>
                    <Input value={form.libelle} onChange={set("libelle")} placeholder="Ex: Sac de riz 50kg" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                </div>

                {/* Sélecteur Mode d'achat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-[#0052cc] font-bold uppercase text-[11px] tracking-wider">Mode d'approvisionnement</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setAchatType("detail")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${achatType === "detail" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-md" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="font-semibold text-sm">Achat au détail</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAchatType("gros")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${achatType === "gros" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-md" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                            <Box className="w-4 h-4" />
                            <span className="font-semibold text-sm">Achat en gros (Pack)</span>
                        </button>
                    </div>

                    {/* Champs dynamiques Prix d'achat */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        {achatType === "detail" ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-slate-600 font-semibold">Prix d'achat unitaire</Label>
                                <div className="relative">
                                    <Input type="number" min="0" value={form.prix_achat} onChange={set("prix_achat")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-semibold">Prix du pack (Gros)</Label>
                                    <div className="relative">
                                        <Input type="number" min="0" value={form.prix_pack} onChange={set("prix_pack")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-semibold">Quantité par pack</Label>
                                    <Input type="number" min="1" value={form.qte_pack} onChange={set("qte_pack")} placeholder="Ex: 12, 24..." className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                                </div>
                            </div>
                        )}
                        {achatType === "gros" && form.prix_pack && form.qte_pack && parseFloat(form.qte_pack) > 0 && (
                            <p className="text-[11px] text-[#0052cc] mt-2 font-medium bg-[#EBF2FF] px-3 py-1 rounded-full inline-block">
                                Soit un prix d'achat unitaire estimé de : <span className="font-bold">{(parseFloat(form.prix_pack) / parseFloat(form.qte_pack)).toLocaleString()} FCFA</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Prix de Vente & Stock */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Prix de vente <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} placeholder="0" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Stock initial</Label>
                        <Input type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                    </div>
                </div>

                {/* Alert & Categorization */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Seuil d'alerte</Label>
                        <Input type="number" min="0" value={form.seuil} onChange={set("seuil")} placeholder="5" className="border-slate-200 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Catégorie</Label>
                        <select value={form.categorie_id} onChange={set("categorie_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none bg-white">
                            <option value="">— Aucun —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Unité</Label>
                        <select value={form.unite_id} onChange={set("unite_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none bg-white">
                            <option value="">— Unité —</option>
                            {unites.map(u => <option key={u.id} value={u.id}>{u.libelle} ({u.abr})</option>)}
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
