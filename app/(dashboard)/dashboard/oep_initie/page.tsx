"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";

export default function OEPInitiePage() {
    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-600/20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Initialisation OEP</h1>
                            <p className="opacity-80">Initialisation de l'Ouverture d'Exploitation Professionnelle</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
                    <Zap className="w-16 h-16 text-emerald-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-2xl font-bold text-slate-800">Page en cours de développement</h2>
                    <p className="text-slate-500 mt-2">Le module d'initialisation OEP sera bientôt disponible sur votre plateforme.</p>
                </div>
            </div>
        </ClientOnly>
    );
}
