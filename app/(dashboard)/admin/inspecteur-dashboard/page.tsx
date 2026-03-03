import RoleDashboard from "../components/RoleDashboard";

export default function InspecteurDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord Inspecteur"
            subtitle="Inspection et contrôle des établissements sanitaires"
            showEtablissements={true}
            defaultFilter="etablissement"
        />
    );
}
