"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";

export default function RenouvellementPage() {
    return (
        <ClientOnly>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="bg-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-600/20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Renouvellement</h1>
                            <p className="opacity-80">Renouvelez votre abonnement pour maintenir vos accès</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
                    <RefreshCw className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-2xl font-bold text-slate-800">Page en cours de développement</h2>
                    <p className="text-slate-500 mt-2">Le module de renouvellement de paiement sera bientôt activé.</p>
                </div>
            </div>
        </ClientOnly>
    );
}
