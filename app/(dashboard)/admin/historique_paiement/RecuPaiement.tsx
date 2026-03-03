"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FileText, Printer, Loader2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function RecuPaiement({ isOpen, onClose, data, size = "xl" }: Props) {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && data) {
            generatePDF();
        } else {
            setPdfUrl("");
        }
    }, [isOpen, data]);

    const generatePDF = () => {
        setIsLoading(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const user = data.user || {};
            const isPro = user.typeUser === "PROFESSIONNEL" || !!user.nom;

            // 1. En-tête officiel
            doc.setFontSize(8);
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "bold");
            doc.text("RÉPUBLIQUE DE CÔTE D'IVOIRE", 14, 15);
            doc.setFont("helvetica", "normal");
            doc.text("Union - Discipline - Travail", 14, 20);
            doc.setDrawColor(200);
            doc.line(14, 23, 60, 23);

            doc.setFontSize(8);
            doc.text("MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE", 14, 28);
            doc.text("ET DE LA COUVERTURE MALADIE UNIVERSELLE", 14, 32);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 82, 204);
            doc.text("DIRECTION DES ÉTABLISSEMENTS PRIVÉS", 14, 38);
            doc.text("ET PROFESSIONS SANITAIRES (DEPPS)", 14, 42);

            // 2. Logo au centre droit
            try {
                doc.addImage("https://mydepps.pages.dev/_files/logo-depps.png", "PNG", pageWidth - 35, 10, 28, 28);
            } catch (e) {
                // Fallback DEPPS text if logo fails
                doc.setFontSize(18);
                doc.text("DEPPS", pageWidth - 35, 25);
            }

            let yPos = 60;

            // Title
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text(`REÇU DE PAIEMENT - ${data.type || 'SANS TYPE'}`, pageWidth / 2, yPos, { align: "center" });

            yPos += 15;
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPos, pageWidth - 15, yPos);

            yPos += 12;

            // Information fields
            const fields = [
                { label: "Date d'édition:", value: data.createdAt ? format(new Date(data.createdAt), "dd/MM/yyyy HH:mm") : 'N/A' },
                { label: "Nom & Prénoms:", value: isPro ? `${user.nom || ''} ${user.prenoms || ''}` : (user.nomEntreprise || user.denomination || 'N/A') },
                { label: "Mode de paiement:", value: data.channel || 'ESPECE' },
                { label: "Contact:", value: user.number || user.telephone || user.contactEntreprise || '—' },
                { label: "Référence:", value: `N° ${data.reference || '—'}` },
                { label: "Montant payé:", value: `${Number(data.montant || 0).toLocaleString('fr-FR')} FCFA` },
                { label: "Profession/Type:", value: user.profession?.libelle || user.typeEtablissement?.libelle || '—' },
            ];

            const startX = 20;
            const labelWidth = 55;
            const fieldLineHeight = 10;

            fields.forEach(({ label, value }) => {
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(80, 80, 80);
                doc.text(label, startX, yPos);

                doc.setFont("helvetica", "bold"); // Bold value too for visibility
                doc.setTextColor(0, 0, 0);
                doc.text(String(value), startX + labelWidth, yPos);

                doc.setDrawColor(240, 240, 240);
                doc.line(startX, yPos + 2, pageWidth - 20, yPos + 2);
                yPos += fieldLineHeight;
            });

            // Notice text
            yPos += 10;
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(180, 50, 50);
            doc.text("Ce document ne tient pas lieu d'autorisation d'exercice.", pageWidth / 2, yPos, { align: "center" });

            // Pied de page officiel
            const footerY = doc.internal.pageSize.getHeight() - 15;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(150, 150, 150);

            doc.setDrawColor(200, 200, 200);
            doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

            doc.text("DEPPS - Ministère de la Santé de Côte d'Ivoire", 14, footerY);
            doc.text("Contacts: (+225) 27-20-21-08-42 / info@depps.ci", 14, footerY + 5);
            doc.text("MyDEPP plateforme - Sygape CI", 14, footerY + 10);

            doc.text(`Généré le: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, footerY, { align: "right" });
            doc.text(`Page 1 / 1`, pageWidth - 14, footerY + 5, { align: "right" });
            doc.text("Document officiel e-DEPPS", pageWidth - 14, footerY + 10, { align: "right" });

            const pdfBlob = doc.output("blob");
            setPdfUrl(URL.createObjectURL(pdfBlob));
        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-[#EBF2FF] p-2 rounded-lg text-[#0052CC]"><Printer className="h-5 w-5" /></div>
                    Aperçu du Reçu Officiel
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full gap-3">
                    <PrimaryButton onClick={onClose} className="px-6 bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 border-0 shadow-none">Fermer</PrimaryButton>
                    <PrimaryButton onClick={() => {
                        if (pdfUrl) {
                            const a = document.createElement("a");
                            a.href = pdfUrl;
                            a.download = `Recu_${data.reference}.pdf`;
                            a.click();
                        }
                    }} className="px-6 flex items-center gap-2 font-bold">
                        <FileText className="w-4 h-4" /> Télécharger PDF
                    </PrimaryButton>
                </div>
            }
        >
            <div className="py-2 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 min-h-[600px] flex items-center justify-center relative">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 text-[#0052CC]">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="font-bold text-slate-900 text-sm">Génération du reçu officiel en cours...</span>
                    </div>
                ) : pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[700px] border-0 rounded-b-xl"
                        title="Aperçu du PDF"
                    />
                ) : (
                    <div className="text-slate-900 font-black">Erreur lors de la génération du PDF.</div>
                )}
            </div>
        </Modal>
    );
}

