// Magasin.ts
export class Magasin {
    magasinId: string;
    nom: string;
    adresse: string;
    pointVente: boolean;
    type: number | null;

    constructor() {
        this.magasinId = '';
        this.nom = '';
        this.adresse = '';
        this.pointVente = false;
        this.type = null;
    }
}