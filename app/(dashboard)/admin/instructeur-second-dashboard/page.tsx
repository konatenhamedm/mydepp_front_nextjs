import RoleDashboard from "../components/RoleDashboard";

export default function InstructeurSecondDashboardPage() {
    return (
        <RoleDashboard
            title="Tableau de bord — Instructeur (2e niveau)"
            subtitle="Instruction des dossiers d'établissements au second niveau"
            mode="dossiers"
            showEtablissements={true}
            defaultFilter="etablissement"
            allowedCards={["etablissement", "date"]}
        />
    );
}
