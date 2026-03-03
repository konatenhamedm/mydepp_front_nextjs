import RoleDashboard from "../components/RoleDashboard";

export default function SousDirecteurEtabDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Sous-Directeur Établissements"
            subtitle="Pilotage des dossiers des établissements de santé"
            mode="dossiers"
            showEtablissements={true}
            defaultFilter="etablissement"
            allowedCards={["etablissement", "date"]}
        />
    );
}
