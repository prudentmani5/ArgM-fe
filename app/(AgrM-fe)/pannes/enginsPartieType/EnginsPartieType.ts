// models/EnginsPartieType.ts
export class EnginsPartieType {
    enginPartieId: number | null;
    partieDesignation: string;
    caractDesignation: string;
    observation: string;
    enginId: string;
    categorie: string;
    unite: string;
    periodicite: number = 0;
    mesure: string;
    ancienMesure: string;
    typeMesure: string;
    engin?: PanEngin; // Optionnel pour l'affichage

    constructor() {
        this.enginPartieId = null;
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

// models/PanEngin.ts (identique à votre classe Java)
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