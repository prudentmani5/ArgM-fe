// models/EnginsEntretiensType.ts
export class EnginsEntretiensType {
    enginEntretiensTypeId: number | null;
    enginId: string;
    entretiensTypeId: number;
    periodicite: number;
    engin?: PanEngin; // Optionnel pour l'affichage
    entretiensType?: EntretiensType; // Optionnel pour l'affichage

    constructor() {
        this.enginEntretiensTypeId = null;
        this.enginId = '';
        this.entretiensTypeId = 0;
        this.periodicite = 0;
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

// models/EntretiensType.ts
export class EntretiensType {
    typeId: number;
    designation: string;

    constructor() {
        this.typeId = 0;
        this.designation = '';
    }
}