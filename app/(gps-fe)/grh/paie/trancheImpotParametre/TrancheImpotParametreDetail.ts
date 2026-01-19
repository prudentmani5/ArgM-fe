export class TrancheImpotParametreDetail {
    trancheId: number;
    numero: number;
    tranche1: number;
    tranche2: number;
    taux: number;
    correctif: number;

    constructor() {
        this.trancheId = 0;
        this.numero = 0;
        this.tranche1 = 0;
        this.tranche2 = 0;
        this.taux = 0;
        this.correctif = 0;
    }
}