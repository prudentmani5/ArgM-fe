// Fournisseur.ts
export class Fournisseur {
    fournisseurId: string;
    nom: string;
    adresse: string | null;
    bp: string | null;
    tel: string | null;
    email: string | null;
    local: boolean;
    compte: string | null;
    donateur: boolean;
    magasinId: string | null;

    constructor() {
        this.fournisseurId = '';
        this.nom = '';
        this.adresse = null;
        this.bp = null;
        this.tel = null;
        this.email = null;
        this.local = false;
        this.compte = null;
        this.donateur = false;
        this.magasinId = null;
    }
}