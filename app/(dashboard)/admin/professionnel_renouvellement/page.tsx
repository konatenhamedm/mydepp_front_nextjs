import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelRenouvellementPage() {
    return (
        <ProfessionnelList
            title="Dossiers en renouvellement"
            description="Liste des dossiers professionnels en cours de renouvellement"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
