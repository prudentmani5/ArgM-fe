// PanRequisitions.ts
export default class PanRequisitions {
    requisitionsId?: number;
    date: Date | null;
    enginId: string;
    catalogue: string;
    indexDepart: number;
    indexFin: number;
    valide: boolean;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpDate: string;
    matricule: string;
    observations: string;
    diffIndex: number;
    consommationHeure: number;
    tonage: number;
    ratio: number;
    dateRendement: Date | null;
    typeRequisition: string;
    consH : number;

    constructor() {
        this.date = null;
        this.enginId = '';
        this.catalogue = '';
        this.indexDepart = 0;
        this.indexFin = 0;
        this.valide = false;
        this.dateCreation = null;
        this.userCreation = '';
        this.dateUpdate = null;
        this.userUpDate = '';
        this.matricule = '';
        this.observations = '';
        this.diffIndex = 0;
        this.consommationHeure = 0;
        this.tonage = 0;
        this.ratio = 0;
        this.dateRendement = null;
        this.typeRequisition = '';
        this.consH=0;
    }
}

export class PanRequisitionsDetails {
    requisitionDetailsId?: number;
    produitPieceId: string;
    quantite: number;
    prixUnitaire: number;
    requisitionsId: number;
    total: number;
    nouvelleQuantite: number;
    initialisation: boolean;

    constructor() {
        this.produitPieceId = '';
        this.quantite = 0;
        this.prixUnitaire = 0;
        this.requisitionsId = 0;
        this.total = 0;
        this.nouvelleQuantite = 0;
        this.initialisation = false;
    }
}

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