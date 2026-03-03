import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelRefusePage() {
    return (
        <ProfessionnelList
            title="Dossiers refusés"
            description="Liste des dossiers professionnels refusés"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
