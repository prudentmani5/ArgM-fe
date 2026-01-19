export class PanDevis {
    devisIncrement?: number;
    devisId: string;
    date: Date | null;
    description: string;
    devisFraisTransport: number;
    tauxTVA: number;
    montantTTVA: number;
    montantTotal: number;
    montantNet: number;

    constructor() {
        this.devisId = '';
        this.date = null;
        this.description = '';
        this.devisFraisTransport = 0;
        this.tauxTVA = 0;
        this.montantTTVA = 0;
        this.montantTotal=0;
        this.montantNet=0;
    }
}

export class PanDevisDetails {
    devisDetailsId?: number;
    devisId: string;
    ordre: number;
    position: string;
    figure: string;
    numPiece: string;
    articleId: string;
    qte: number;
    pu: number;
    pt: number;
    fraisTransport: number;

    constructor() {
        this.devisId = '';
        this.ordre = 0;
        this.position = '';
        this.figure = '';
        this.numPiece = '';
        this.articleId = '';
        this.qte = 0;
        this.pu = 0;
        this.pt = 0;
        this.fraisTransport = 0;
    }
}

export class StkArticle {
    articleId: string;
    codeArticle: string;
    libelle: string;
    uniteId: string;
    qteStock: number;
    pump: number;
    prixVente: number;

    constructor() {
        this.articleId = '';
        this.codeArticle = '';
        this.libelle = '';
        this.uniteId = '';
        this.qteStock = 0;
        this.pump = 0;
        this.prixVente = 0;
    }
}