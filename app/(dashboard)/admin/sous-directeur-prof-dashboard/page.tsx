import RoleDashboard from "../components/RoleDashboard";

export default function SousDirecteurProfDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Sous-Directeur Pro"
            subtitle="Pilotage des dossiers des professionnels de santé"
            mode="dossiers"
            showEtablissements={false}
            defaultFilter="all"
        />
    );
}
