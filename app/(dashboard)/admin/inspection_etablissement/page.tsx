import ProfessionnelList from "../components/ProfessionnelList";

export default function InspectionEtablissementPage() {
    return (
        <ProfessionnelList
            title="Inspection des établissements"
            description="Dossiers d'établissements affectés à l'inspecteur connecté"
            apiPath="/etablissement/"
            showView={true}
            showImputation={false}
        />
    );
}
