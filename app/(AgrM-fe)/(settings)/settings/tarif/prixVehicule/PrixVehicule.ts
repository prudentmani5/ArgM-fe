export class PrixVehicule {
    paramVehiculeId: number | null;
    poids1: number;
    poids2: number;
    montant: number;

    constructor() {
        this.paramVehiculeId = null;
        this.poids1 = 0;
        this.poids2 = 0;
        this.montant = 0;
    }
}