export class Diplome {
    diplomePersId: number;
    matriculeId: string;
    typeDiplomeId: string;
    paysId: string;
    institut: string;
    dateObtention: string;
    note: number;
    referenceEquivalence: string;

    constructor() {
        this.diplomePersId = 0;
        this.matriculeId = '';
        this.typeDiplomeId = '';
        this.paysId = '';
        this.institut = '';
        this.dateObtention = '';
        this.note = 0;
        this.referenceEquivalence = '';
    }
}