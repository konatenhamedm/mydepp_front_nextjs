import RoleDashboard from "../components/RoleDashboard";

export default function DirecteurDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Directeur"
            subtitle="Vue globale des dossiers professionnels et établissements"
            mode="dossiers"
            showEtablissements={true}
            defaultFilter="all"
        />
    );
}
