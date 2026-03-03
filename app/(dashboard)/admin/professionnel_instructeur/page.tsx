import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelInstructeurPage() {
    return (
        <ProfessionnelList
            title="Mes dossiers professionnels"
            description="Dossiers professionnels affectés à l'instructeur connecté"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
