export class StkArticleStock {
    articleStockId: string;
    articleId: string;
    datePeremption: string | null;
    lot: string | null;
    magasinId: string;
    libelle: string;
    uniteId: string | null;
    qteStock: number | null;
    prixUnitaire: number | null;
    qtePhysique: number | null;
    prixVente: number | null;
    pump: number | null;
    marge: number | null;
    dateFabrication: string | null;
    caseId: string | null;

    constructor() {
        this.articleStockId = "";
        this.articleId = "";
        this.datePeremption = null;
        this.lot = null;
        this.magasinId = "";
        this.libelle = "";
        this.uniteId = null;
        this.qteStock = null;
        this.prixUnitaire = null;
        this.qtePhysique = null;
        this.prixVente = null;
        this.pump = null;
        this.marge = null;
        this.dateFabrication = null;
        this.caseId = null;
    }
}