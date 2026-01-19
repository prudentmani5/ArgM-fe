// models/EnginsPieceRechange.ts
export class EnginsPieceRechange {
    enginPieceRechangeId: string | null;
    enginId: string;
    pieceRechangeId: string;
    engin?: PanEngin; // Optionnel pour l'affichage
    pieceRechange?: PieceRechange; // Optionnel pour l'affichage

    constructor() {
        this.enginPieceRechangeId = null;
        this.enginId = '';
        this.pieceRechangeId = '';
    }
}

// models/PanEngin.ts
export class PanEngin {
    enginId: string;
    enginDesignation: string;
    modele: string;
    marque: string;
    indexDepart: number;
    type: string;
    anneeFabrication: string;
    numeroOrdre: string;
    numeroSerie: string;
    categorieId: number;
    dateSortie: Date;
    motif: string;
    caracteristiques: string;
    dateUpdate: Date;
    consH: number;

    constructor() {
        this.enginId = '';
        this.enginDesignation = '';
        this.modele = '';
        this.marque = '';
        this.indexDepart = 0;
        this.type = '';
        this.anneeFabrication = '';
        this.numeroOrdre = '';
        this.numeroSerie = '';
        this.categorieId = 0;
        this.dateSortie = new Date();
        this.motif = '';
        this.caracteristiques = '';
        this.dateUpdate = new Date();
        this.consH = 0;
    }
}

// models/PieceRechange.ts
export class PieceRechange {
    pieceRechangeId: string;
    designationPieceRechange: string;
    numeroCatalogue: string;
    uniteId: string;
    prixUnitaire: number;

    constructor() {
        this.pieceRechangeId = '';
        this.designationPieceRechange = '';
        this.numeroCatalogue = '';
        this.uniteId = '';
        this.prixUnitaire = 0;
    }
}