export class Excedent {
    excedentId: number | null;
    type: string | null;
    montantExcedent: number | null;
    montant: number | null;
    tva: number | null;
    dateExcedent: Date | null;

    constructor() {
        this.excedentId = null;
        this.type = null;
        this.montantExcedent = null;
        this.montant = null;
        this.tva = null;
        this.dateExcedent = null;
    }
}