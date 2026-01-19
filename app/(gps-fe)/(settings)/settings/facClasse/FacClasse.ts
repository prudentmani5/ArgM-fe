// FacClasse.ts
export class FacClasse {
    classeId: number | null;
    categorieId: string;
    codeClasse: string;
    prixCamion: number | null;
    prixBarge: number | null;
    compte: string;

    constructor() {
        this.classeId = null;
        this.categorieId = '';
        this.codeClasse = '';
        this.prixCamion = null;
        this.prixBarge = null;
        this.compte = '';
    }
}