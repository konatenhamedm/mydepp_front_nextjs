import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelValidePage() {
    return (
        <ProfessionnelList
            title="Dossiers validés"
            description="Liste des dossiers professionnels validés"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
