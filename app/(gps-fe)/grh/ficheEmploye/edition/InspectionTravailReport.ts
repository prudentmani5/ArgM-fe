export interface InspectionTravailEmployee {
    matriculeId: string;
    nom: string;
    prenom: string;
    dateEngagement: number | null; // anneeEmbauche from carriere
    natureTravail: string; // fonctionId from carriere
    natureTravailLibelle: string; // fonction label for display
    dateCessation: Date | null; // dateSituation from identification (null for active)
    causeCessation: string; // causeSituation from identification (empty for active)
}

export class InspectionTravailReport {
    employees: InspectionTravailEmployee[];

    constructor() {
        this.employees = [];
    }
}
