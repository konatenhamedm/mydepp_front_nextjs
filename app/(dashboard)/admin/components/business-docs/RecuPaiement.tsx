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
                const res = await apiFetch(`/paiement/info/transaction/last/transaction/formatter/${data.id}`);
                const responseData = res?.data;

                if (!responseData) {
                    throw new Error("No data returned for transaction");
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
                const pageWidth = 210;

                const imgWidth = 30;
                const imgHeight = 30;
                const logoX = (pageWidth - imgWidth) / 2;
                try {
                    doc.addImage("https://mydepps.pages.dev/_files/logo-depps.png", "PNG", logoX, 10, imgWidth, imgHeight);
                } catch (e) {
                    doc.setFontSize(10);
                    doc.text("Logo DEPPS", pageWidth / 2, 25, { align: "center" });
                }

                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text(receiptData.title, 105, 50, { align: "center" });

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");

                const startX = 10;
                const lineHeight = 10;
                let yPos = 60;

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

                // Footer
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text(receiptData.footerText, 105, yPos + 10, { align: "center" });

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
