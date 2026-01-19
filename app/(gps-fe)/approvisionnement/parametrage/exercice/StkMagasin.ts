// StkMagasin.ts
export class StkMagasin {
    magasinId: string;
    nom: string;
    adresse: string;
    pointVente: boolean;
    type: number;

    constructor() {
        this.magasinId = '';
        this.nom = '';
        this.adresse = '';
        this.pointVente = false;
        this.type = 0;
    }
}