export class Exporter {
    exportateurId: number | null;
    nom: string;
    adresse: string;
    tel: string;
    fax: string;
    compte: boolean;
    compteCredit: string;

    constructor() {
        this.exportateurId = null;
        this.nom = '';
        this.adresse = '';
        this.tel = '';
        this.fax = '';
        this.compte = false;
        this.compteCredit = '';
    }
}