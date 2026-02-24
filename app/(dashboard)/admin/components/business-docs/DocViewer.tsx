"use client";

import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

interface Props {
    url: string | null;
    alt?: string;
}

export function DocViewer({ url, alt = "Document" }: Props) {
    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 gap-3">
                <FileText className="w-10 h-10 opacity-50" />
                <span className="text-sm font-medium">Aucun document disponible</span>
            </div>
        );
    }

    const isPdf = url.toLowerCase().includes(".pdf");

    return (
        <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            {isPdf ? (
                <iframe
                    src={url}
                    width="100%"
                    height="700px"
                    className="w-full bg-white"
                    title={alt}
                >
                    <p className="p-4 text-center text-slate-500">
                        Votre navigateur ne prend pas en charge les PDF.{" "}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Télécharger le fichier
                        </a>
                        .
                    </p>
                </iframe>
            ) : (
                <div className="p-4 flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium w-full justify-between pb-2 border-b border-slate-200">
                        <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> {alt}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ouvrir</a>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={url}
                        alt={alt}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm bg-white"
                    />
                </div>
            )}
        </div>
    );
}
