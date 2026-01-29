// Importer.ts
export class Importer {
    importateurId: number | null;
    nom: string;
    adresse: string;
    tel: string;
    fax: string;
    compteDebit: string;
    facture: boolean;
    compteCredit: string;
    nif: string;
    email: string;
    assujetiTVA: number | null;
    actif: boolean;

    constructor() {
        this.importateurId = null;
        this.nom = '';
        this.adresse = '';
        this.tel = '';
        this.fax = '';
        this.compteDebit = '';
        this.facture = false;
        this.compteCredit = '';
        this.nif = '';
        this.email = '';
        this.assujetiTVA = null;
        this.actif = true;
    }
}