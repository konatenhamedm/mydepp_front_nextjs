import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelAttentePage() {
    return (
        <ProfessionnelList
            title="Dossiers en attente"
            description="Liste des dossiers professionnels en attente de traitement"
            apiPath="/professionnel/"
            showView={true}
            showImputation={true}
        />
    );
}
