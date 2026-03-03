import RoleDashboard from "../components/RoleDashboard";

export default function InstructeurEtabDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Instructeur Établissements"
            subtitle="Instruction et suivi des dossiers d'établissements de santé"
            mode="dossiers"
            showEtablissements={true}
            defaultFilter="etablissement"
            allowedCards={["etablissement", "date"]}
        />
    );
}
