// models/PanEngin.ts
export class PanEngin {
    enginId: string | null;
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
    categorie?: EnginsCategorie; // Optionnel pour l'affichage

    constructor() {
        this.enginId = null;
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

// models/EnginsCategorie.ts
export class EnginsCategorie {
    enginCategorieId: number;
    categorieDesignation: string;

    constructor() {
        this.enginCategorieId = 0;
        this.categorieDesignation = '';
    }
}