import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelAjourPage() {
    return (
        <ProfessionnelList
            title="Professionnels à jour"
            description="Liste des professionnels dont le statut est à jour"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
