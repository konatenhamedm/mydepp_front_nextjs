import ProfessionnelList from "../components/ProfessionnelList";

export default function ProfessionnelInstructeurSecondPage() {
    return (
        <ProfessionnelList
            title="Dossiers — Instructeur 2ème niveau"
            description="Dossiers professionnels à traiter au second niveau d'instruction"
            apiPath="/professionnel/"
            showView={true}
            showImputation={false}
        />
    );
}
