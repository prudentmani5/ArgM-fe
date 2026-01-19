export class PrixSurtaxe {
    paramSurtaxeId: number | null;
    poids1: number;
    poids2: number;
    taux: number;

    constructor() {
        this.paramSurtaxeId = null;
        this.poids1 = 0;
        this.poids2 = 0;
        this.taux = 0;
    }
}