"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FileText, Printer } from "lucide-react";
import { PrimaryButton } from "@/components/ui/page-components";
import jsPDF from "jspdf";

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

            // Receipt Context
            const title = `Reçu de Paiement - ${data.type}`;
            const footerText = 'Ce document ne tient pas lieu d’autorisation d’exercice';
            const user = data.user || {};

            // Logo simulation (Fallback if image isn't loaded correctly, let's keep it simple text or base64 if we had it. I'll use text for 'DEPPS')
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 82, 204);
            doc.text("DEPPS", 105, 20, { align: "center" });

            // Title
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59); // slate-800
            doc.text(title, 105, 40, { align: "center" });

            // Line separator
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.line(20, 45, 190, 45);

            // Information
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            const startX = 20;
            const startY = 60;
            const lineHeight = 12;

            const fields = [
                { label: "Date d'édition:", value: new Date(data.createdAt).toLocaleDateString("fr-FR") },
                { label: "Nom:", value: user.nom || user.nomEntreprise || '' },
                { label: "Prénom(s):", value: user.prenoms || '' },
                { label: "Mode de paiement:", value: data.channel || 'Non renseigné' },
                { label: "Numéro de téléphone:", value: user.number || user.contactEntreprise || '' },
                { label: "Référence paiement:", value: `N° ${data.reference}` },
                { label: "Montant payé:", value: `${Number(data.montant).toLocaleString('fr-FR')} FCFA` },
                { label: "Profession:", value: user.profession?.libelle || '' },
            ];

            let yPos = startY;
            fields.forEach(({ label, value }) => {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(100, 116, 139); // slate-500
                doc.text(label, startX, yPos);

                doc.setFont("helvetica", "bold");
                doc.setTextColor(15, 23, 42); // slate-900
                doc.text(value || 'N/A', startX + 60, yPos);

                doc.setDrawColor(241, 245, 249); // slate-100
                doc.line(startX, yPos + 3, 190, yPos + 3);

                yPos += lineHeight;
            });

            // Footer
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(footerText, 105, 280, { align: "center" }); // Bottom of A4

            const pdfBlob = doc.output("blob");
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
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
                    Aperçu du Reçu
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full gap-3">
                    <PrimaryButton onClick={onClose} className="px-6 bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 shadow-none">Fermer</PrimaryButton>
                    <PrimaryButton onClick={() => {
                        if (pdfUrl) {
                            const a = document.createElement("a");
                            a.href = pdfUrl;
                            a.download = `Recu_${data.reference}.pdf`;
                            a.click();
                        }
                    }} className="px-6 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Télécharger PDF
                    </PrimaryButton>
                </div>
            }
        >
            <div className="py-2 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 min-h-[600px] flex items-center justify-center relative">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 text-[#0052CC]">
                        <div className="w-8 h-8 border-4 border-[#0052CC]/20 border-t-[#0052CC] rounded-full animate-spin" />
                        <span className="font-semibold text-sm">Génération du reçu en cours...</span>
                    </div>
                ) : pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[700px] border-0 rounded-b-xl"
                        title="Aperçu du PDF"
                    />
                ) : (
                    <div className="text-slate-500 font-medium">Erreur lors de la génération du PDF.</div>
                )}
            </div>
        </Modal>
    );
}
