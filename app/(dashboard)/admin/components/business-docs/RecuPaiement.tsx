"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/axios";

interface Props {
    data: any;
}

export function RecuPaiement({ data }: Props) {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!data || !data.id) {
            setIsLoading(false);
            return;
        }

        const fetchAndGenerate = async () => {
            setIsLoading(true);
            try {
                // Fetch transaction infos
                const res = await apiFetch(`/paiement/info/transaction/last/transaction/formatter/${data.id}`, { provenance: true });
                const responseData = res?.data;

                if (!responseData) {
                    setIsLoading(false);
                    return; // Fail gracefully by stopping loading without generating PDF, the component handles empty state below
                }

                // Initialiser structure du reçu
                const p = responseData.user?.personne || {};
                const isPro = responseData.user?.typeUser === "PROFESSIONNEL";

                const receiptData = {
                    title: "Reçu de Paiement - " + (responseData.type || "Renouvellement"),
                    date: responseData.createdAt ? format(new Date(responseData.createdAt), "dd MMMM yyyy à HH:mm:ss") : format(new Date(), "dd MMMM yyyy à HH:mm:ss"),
                    name: isPro ? (p.nom || p.nomRepresentant) : (p.nomEntreprise || p.denomination || "N/A"),
                    prenoms: isPro ? p.prenoms : "",
                    paymentMethod: responseData.channel || "N/A",
                    phone: isPro ? (p.number || p.telephone) : (p.contactEntreprise || p.telephone),
                    receiptNumber: responseData.reference || "N/A",
                    profession: p.profession?.libelle || p.typeEtablissement?.libelle || "N/A",
                    amount: responseData.montant || "0",
                    footerText: "Ce document ne tient pas lieu d’autorisation d’exercice",
                };

                // Generation PDF
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                let yPos = 15;

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

                // 2. Logo au centre droit (aligné propre)
                try {
                    doc.addImage("https://mydepps.pages.dev/_files/logo-depps.png", "PNG", pageWidth - 35, 10, 28, 28);
                } catch (e) {
                    // fallback
                }

                yPos = 60;

                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "bold");
                doc.text(receiptData.title, pageWidth / 2, yPos, { align: "center" });
                yPos += 15;

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");

                const startX = 10;
                const lineHeight = 10;
                yPos = 85;

                const writeLine = (label: string, value: string) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(label, startX, yPos);
                    doc.setFont("helvetica", "normal");
                    doc.text(String(value || "N/A"), startX + 50, yPos);
                    doc.setFont("helvetica", "bold");
                    doc.setDrawColor(200, 200, 200);
                    doc.line(startX, yPos + 2, 200, yPos + 2);
                    yPos += lineHeight;
                };

                writeLine("Date d'édition:", receiptData.date);
                writeLine("Nom:", receiptData.name);
                if (receiptData.prenoms) {
                    writeLine("Prénom(s):", receiptData.prenoms);
                }
                writeLine("Mode de paiement:", receiptData.paymentMethod);
                writeLine("N° de téléphone:", receiptData.phone || "N/A");
                writeLine("Réf. paiement:", "N° " + receiptData.receiptNumber);
                writeLine("Paiement:", String(receiptData.amount) + " XOF");
                writeLine("Catégorie:", receiptData.profession);

                // Footer 1 - Notice
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(180, 50, 50);
                doc.text(receiptData.footerText, pageWidth / 2, yPos + 10, { align: "center" });

                // Pied de page officiel
                const footerY = doc.internal.pageSize.getHeight() - 15;
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150, 150, 150);

                // Ligne de séparation
                doc.setDrawColor(200, 200, 200);
                doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

                doc.text("DEPPS - Ministère de la Santé de Côte d'Ivoire", 14, footerY);
                doc.text("Contacts: (+225) 27-20-21-08-42 / info@depps.ci", 14, footerY + 5);
                doc.text("MyDEPP plateforme - Sygape CI", 14, footerY + 10);

                doc.text(`Généré le: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, footerY, { align: "right" });
                const totalPages = doc.getNumberOfPages();
                doc.text(`Page 1 / ${totalPages}`, pageWidth - 14, footerY + 5, { align: "right" });
                doc.text("Reçu de paiement e-DEPPS", pageWidth - 14, footerY + 10, { align: "right" });

                const pdfBlob = doc.output("blob");
                setPdfUrl(URL.createObjectURL(pdfBlob));
            } catch (error) {
                console.error("Erreur génération PDF Reçu: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndGenerate();
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-slate-50 rounded-xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
            </div>
        );
    }

    if (!pdfUrl) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Aucun reçu disponible ou erreur lors de la génération.</div>;
    }

    return (
        <iframe src={pdfUrl} width="100%" height="600px" className="border rounded-xl shadow-sm bg-white" title="Reçu de Paiement"></iframe>
    );
}
