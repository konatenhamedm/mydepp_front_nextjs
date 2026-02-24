"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Props {
    data: any;
}

export function FicheInscription({ data }: Props) {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!data) return;

        const generatePDF = async () => {
            setIsLoading(true);
            try {
                const doc = new jsPDF();
                const p = data.personne || data || {};

                const pageWidth = doc.internal.pageSize.getWidth();
                const margin = 15;
                const lineHeight = 7;
                let yPos = margin;

                // Logo placeholder
                const logoWidth = 30;
                const logoHeight = 30;
                const logoX = (pageWidth - logoWidth) / 2;

                try {
                    doc.addImage("https://mydepps.pages.dev/_files/logo-depps.png", "PNG", logoX, yPos, logoWidth, logoHeight);
                } catch (e) {
                    doc.setFontSize(10);
                    doc.text("Logo DEPPS", pageWidth / 2, yPos + 15, { align: "center" });
                }

                yPos += logoHeight + 10;

                // Titre
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("FICHE D'INSCRIPTION", pageWidth / 2, yPos, { align: "center" });
                yPos += 10;

                // Sous-titre
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text("Ministère de la Santé, de l'Hygiène Publique et de la Couverture Maladie Universelle", pageWidth / 2, yPos, { align: "center" });
                doc.text("Direction des Établissements Privés et Professions Sanitaires (DEPPS)", pageWidth / 2, yPos + 5, { align: "center" });

                yPos += 15;
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPos, pageWidth - margin, yPos);

                yPos += 10;

                // Informations
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 130, 246);
                doc.text("INFORMATIONS GÉNÉRALES", margin, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                const col1 = margin;
                const col2 = pageWidth / 2;

                const writeField = (label: string, value: string, x: number, y: number) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(label, x, y);
                    const labelW = doc.getTextWidth(label + " ");
                    doc.setFont("helvetica", "normal");
                    doc.text(String(value || "N/A"), x + labelW, y);
                };

                // Logic to handle both Professionnel and Etablissement (OEP)
                const isFirm = !!p.denomination || !!p.typeEtablissement;

                if (isFirm) {
                    writeField("Dénomination:", p.denomination || "N/A", col1, yPos);
                    writeField("Type Etablissement:", p.typeEtablissement?.libelle || "N/A", col2, yPos);
                    writeField("Représentant:", p.nomRepresentant || "N/A", col1, yPos + lineHeight);
                    writeField("Email:", data.email || p.emailAutre || "N/A", col2, yPos + lineHeight);
                    writeField("Téléphone:", p.telephone || "N/A", col1, yPos + lineHeight * 2);
                    writeField("Adresse:", p.adresse || "N/A", col2, yPos + lineHeight * 2);
                } else {
                    writeField("Nom et Prénoms:", `${p.nom} ${p.prenoms}`, col1, yPos);
                    writeField("Date de naissance:", p.dateNaissance || "N/A", col2, yPos);
                    writeField("Nationalité:", p.nationate?.libelle || "N/A", col1, yPos + lineHeight);
                    writeField("Contact:", p.number || p.telephone || "N/A", col2, yPos + lineHeight);
                    writeField("Email:", data.email || "N/A", col1, yPos + lineHeight * 2);
                    writeField("Situation matrimoniale:", p.situation || "N/A", col2, yPos + lineHeight * 2);
                }

                yPos += lineHeight * 4 + 10;

                // Section 2 (Professionnelle ou Localisation)
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 130, 246);
                doc.text(isFirm ? "LOCALISATION ET SUIVI" : "INFORMATIONS PROFESSIONNELLES", margin, yPos);
                yPos += 10;

                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                if (isFirm) {
                    writeField("Région:", p.region?.libelle || "N/A", col1, yPos);
                    writeField("Ville:", p.ville?.libelle || "N/A", col2, yPos);
                    writeField("District:", p.district?.libelle || "N/A", col1, yPos + lineHeight);
                    writeField("Commune:", p.commune?.libelle || "N/A", col2, yPos + lineHeight);
                    writeField("Quartier:", p.quartier || "N/A", col1, yPos + lineHeight * 2);
                    writeField("Code Dossier:", p.code || "N/A", col2, yPos + lineHeight * 2);
                } else {
                    writeField("Profession:", p.profession?.libelle || "N/A", col1, yPos);
                    writeField("Diplôme:", p.diplome || "N/A", col2, yPos);
                    writeField("Date Diplôme:", p.dateDiplome || "N/A", col1, yPos + lineHeight);
                    writeField("Lieu d'exercice:", p.lieuExercicePro || "N/A", col2, yPos + lineHeight);
                    writeField("Structure:", p.professionnel || "N/A", col1, yPos + lineHeight * 2);
                    writeField("Code membre:", p.code || "N/A", col2, yPos + lineHeight * 2);
                }

                // Pied de page
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Fiche générée le ${format(new Date(), "dd/MM/yyyy à HH:mm:ss")}`, pageWidth / 2, 280, { align: "center" });
                doc.text("DEPPS - Ministère de la Santé de Côte d'Ivoire", pageWidth / 2, 285, { align: "center" });

                const pdfBlob = doc.output("blob");
                setPdfUrl(URL.createObjectURL(pdfBlob));
            } catch (error) {
                console.error("Erreur génération PDF Fiche: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        generatePDF();
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-slate-50 rounded-xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
            </div>
        );
    }

    if (!pdfUrl) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Erreur lors de la génération de la fiche.</div>;
    }

    return (
        <iframe src={pdfUrl} width="100%" height="600px" className="border rounded-xl shadow-sm bg-white" title="Fiche d'inscription"></iframe>
    );
}
