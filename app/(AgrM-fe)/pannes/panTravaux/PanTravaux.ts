// panTravaux.model.ts
export class PanTravaux {
    travauxIncrement?: number;
    travauxId: string;
    date: Date | null;
    valide: boolean;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpDate: string;
    type: string;
    matricule: string;
    enginId: string;
    client: string;
    clientFone: string;
    clientAdresse: string;
    clientNif: string;
    description: string;
    tauxTVA: number;
    montantTVA: number;
    activiteTravaux: string;
    indexKilometrique: string;
    mo: number;
    catalogue: string;
    observationTravaux: string;
    anomalieTravaux: string;
    dureTravaux: string;

    constructor() {
        this.travauxId = '';
        this.date = null;
        this.valide = false;
        this.dateCreation = null;
        this.userCreation = '';
        this.dateUpdate = null;
        this.userUpDate = '';
        this.type = '';
        this.matricule = '';
        this.enginId = '';
        this.client = '';
        this.clientFone = '';
        this.clientAdresse = '';
        this.clientNif = '';
        this.description = '';
        this.tauxTVA = 0;
        this.montantTVA = 0;
        this.activiteTravaux = '';
        this.indexKilometrique = '';
        this.mo = 0;
        this.catalogue = '';
        this.observationTravaux = '';
        this.anomalieTravaux = '';
        this.dureTravaux = '';
    }
}

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