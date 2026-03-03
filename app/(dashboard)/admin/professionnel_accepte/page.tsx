import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelAcceptePage() {
    return (
        <ProfessionnelList
            title="Dossiers acceptés"
            description="Liste des dossiers professionnels au statut accepté"
            apiPath="/professionnel/"
            showView={true}
            showImputation={true}
        />
    );
}
