import RoleDashboard from "../components/RoleDashboard";

export default function ComptableDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Comptable"
            subtitle="Suivi des transactions et paiements de la plateforme"
            mode="comptable"
            showEtablissements={true}
            defaultFilter="all"
        />
    );
}
