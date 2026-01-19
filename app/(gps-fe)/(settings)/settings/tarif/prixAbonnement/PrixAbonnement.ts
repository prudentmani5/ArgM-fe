export class PrixAbonnement {
    paramAboneId: number | null;
    poids1: number;
    poids2: number;
    montantMois: number;
    montantTour: number;

    constructor() {
        this.paramAboneId = null;
        this.poids1 = 0;
        this.poids2 = 0;
        this.montantMois = 0;
        this.montantTour = 0;
    }
}