export class StkSousCategorie {
    sousCategorieId: string;
    categorieId: string;
    magasinId: string | null;
    libelle: string;
    compte: string | null;

    constructor() {
        this.sousCategorieId = "";
        this.categorieId = "";
        this.magasinId = null;
        this.libelle = "";
        this.compte = null;
    }
}