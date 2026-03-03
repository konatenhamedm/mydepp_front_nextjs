"use client";

import RoleDashboard from "../components/RoleDashboard";
import { useSession } from "next-auth/react";

export default function InstructeurDashboardPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    // Determine configuration based on role
    const isEtabRole = userRole?.includes("ETAB") || userRole?.includes("INSPECTEUR");

    return (
        <RoleDashboard
            title={isEtabRole ? "Tableau de bord — Instructeur Établissements" : "Tableau de bord — Instructeur"}
            subtitle={isEtabRole ? "Instruction et suivi des dossiers d'établissements de santé" : "Suivi et gestion des dossiers professionnels"}
            mode="dossiers"
            showEtablissements={isEtabRole}
            defaultFilter={isEtabRole ? "etablissement" : "all"}
            allowedCards={isEtabRole ? ["etablissement", "date"] : ["all", "attente", "accepted", "rejected", "validated", "a_jour", "date"]}
        />
    );
}
