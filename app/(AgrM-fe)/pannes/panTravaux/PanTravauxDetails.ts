// panTravauxDetails.model.ts
export class PanTravauxDetails {
    travauxDetailsId?: number;
    indexKilometrique: string;
    travauxId: string;
    mo: number;
    catalogue: string;
    quantite: number;
    observation: string;
    activite: string;
    duree: string;
    materiel: string;
    pu: number;
    pt: number;
    articleId: string;
    anomalie: string;
    articleExterne: string;

    constructor() {
        this.indexKilometrique = '';
        this.travauxId = '';
        this.mo = 0;
        this.catalogue = '';
        this.quantite = 0;
        this.observation = '';
        this.activite = '';
        this.duree = '';
        this.materiel = '';
        this.pu = 0;
        this.pt = 0;
        this.articleId = '';
        this.anomalie = '';
        this.articleExterne = '';
    }
}