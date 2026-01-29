export class StkSortie {
    sortieId: string;
    numeroPiece: string;
    magasinId: string;
    exerciceId: string;
    typeMvtId: string;
    dateSortie: Date | null;
    servRespIdSuperviseur: string;
    servRespIdDemandeur: string;
    reference: string;
    montant: number;
    matricule: string;
    ayantDroit: string;
    magRespId: string;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    destinationId: string;

    constructor() {
        this.sortieId = '';
        this.numeroPiece = '';
        this.magasinId = '';
        this.exerciceId = '';
        this.typeMvtId = '';
        this.dateSortie = null;
        this.servRespIdSuperviseur = '';
        this.servRespIdDemandeur = '';
        this.reference = '';
        this.montant = 0;
        this.matricule = '';
        this.ayantDroit = '';
        this.magRespId = '';
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
        this.destinationId = '';
    }
}

export class StkSortieDetails {
    sortieDetailsId: number;
    sortieId: string;
    numeroPiece: string;
    articleId: string;
    articleStockId: string;
    datePeremption: string;
    lot: string;
    uniteId: string;
    qteS: number;
    prixS: number;
    pUMP: number;
    prixVente: number;
    prixTotal: number;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    pAU: number;
    qteError?: string;
    [key: string]: any;

    constructor() {
        this.sortieDetailsId = 0;
        this.sortieId = '';
        this.numeroPiece = '';
        this.articleId = '';
        this.articleStockId = '';
        this.datePeremption = '';
        this.lot = '';
        this.uniteId = '';
        this.qteS = 0;
        this.prixS = 0;
        this.pUMP = 0;
        this.prixVente = 0;
        this.prixTotal = 0;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
        this.pAU = 0;
    }
}

export class TypeMvt {
    typeMvtId: string;
    libelle: string;
    sens: string;

    constructor() {
        this.typeMvtId = '';
        this.libelle = '';
        this.sens = '';
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

export class StkExercice {
    exerciceId: string;
    libelle: string;
    annee: string;

    constructor() {
        this.exerciceId = '';
        this.libelle = '';
        this.annee = '';
    }
}

export class StkMagasin {
    magasinId: string;
    nom: string;
    adresse: string;

    constructor() {
        this.magasinId = '';
        this.nom = '';
        this.adresse = '';
    }
}

export class StkMagasinResponsable {
    magRespId: string;
    magasinId: string;
    responsableId: string;

    constructor() {
        this.magRespId = '';
        this.magasinId = '';
        this.responsableId = '';
    }
}

export class StkServiceResponsable {
    servRespId: string;
    serviceId: string;
    responsableId: string;

    constructor() {
        this.servRespId = '';
        this.serviceId = '';
        this.responsableId = '';
    }
}

export class StkUnite {
    uniteId: string;
    libelle: string;

    constructor() {
        this.uniteId = '';
        this.libelle = '';
    }
}


export type StkSortieDetailField = 
    'sortieDetailsId' | 'sortieId' | 'numeroPiece' | 'articleId' | 
    'articleStockId' | 'datePeremption' | 'lot' | 'uniteId' | 
    'qteS' | 'prixS' | 'pUMP' | 'prixVente' | 'prixTotal' | 
    'userCreation' | 'dateCreation' | 'userUpdate' | 'dateUpdate' | 'pAU';