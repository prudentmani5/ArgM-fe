// panPannes.model.ts
// panPannes.model.ts
export interface PanPannes {
    pannesIncrement?: number;
    pannesId: string;
    enginId: string;
    enginPartieId: number;
    dateDebut: Date | null;
    observation: string;
    valide: boolean;
    dateFin: Date | null;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpDate: string;
    numeroOrdre: number;
    heure: number;
    anomalie: string;
    activite: string;
    materiel: string;
}

export function createPanPannes(): PanPannes {
    return {
        pannesId: '',
        enginId: '',
        enginPartieId: 0,
        dateDebut: null,
        observation: '',
        valide: false,
        dateFin: null,
        dateCreation: null,
        userCreation: '',
        dateUpdate: null,
        userUpDate: '',
        numeroOrdre: 0,
        heure: 0,
        anomalie: '',
        activite: '',
        materiel: ''
    };
}

// panPannesDetails.model.ts
export class PanPannesDetails {
    pannesDetailsId?: number;
    pannesId: string;
    produitPieceId: string;
    quantite: number;
    prixUnitaire: number;
    total: number;

    constructor() {
        this.pannesId = '';
        this.produitPieceId = '';
        this.quantite = 0;
        this.prixUnitaire = 0;
        this.total = 0;
    }
}

// panEngin.model.ts
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
    dateSortie: Date | null;
    motif: string;
    caracteristiques: string;
    dateUpdate: Date | null;
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
        this.dateSortie = null;
        this.motif = '';
        this.caracteristiques = '';
        this.dateUpdate = null;
        this.consH = 0;
    }
}

// enginsPartieType.model.ts
export class EnginsPartieType {
    enginPartieId: number;
    partieDesignation: string;
    caractDesignation: string;
    observation: string;
    enginId: string;
    categorie: string;
    unite: string;
    periodicite: number;
    mesure: string;
    ancienMesure: string;
    typeMesure: string;

    constructor() {
        this.enginPartieId = 0;
        this.partieDesignation = '';
        this.caractDesignation = '';
        this.observation = '';
        this.enginId = '';
        this.categorie = '';
        this.unite = '';
        this.periodicite = 0;
        this.mesure = '';
        this.ancienMesure = '';
        this.typeMesure = '';
    }
}

// pieceRechange.model.ts
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