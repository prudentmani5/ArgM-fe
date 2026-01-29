export class StkSortie {
    sortieId: string;
    numeroPiece: string;
    magasinId: string;
    exerciceId: string;
    typeMvtId: string;
    dateSortie: Date | null;
    magRespId: string;
    serviceId: string;
    montant: number;
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
        this.magRespId = '';
        this.serviceId = '';
        this.montant = 0;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
        this.destinationId = '';
    }
}

export class StkSortieDetails {
    sortieDetailsId?: number;
    sortieId: string;
    numeroPiece: string;
    articleId: string;
    articleStockId: string;
    datePeremption: Date | null;
    lot: string;
    uniteId: string;
    qteS: number;
    prixS: number;
    pUMP: number;
    prixVente: number;
    pas: number;
    qteSolde: number;
    arrondi: number;
    dateFabrication: Date | null;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpdate: string;
    pau: number;
    prixTotal: number;
    qteError: string;
    prixError: string;

    constructor() {
        this.sortieDetailsId = 0;
        this.sortieId = '';
        this.numeroPiece = '';
        this.articleId = '';
        this.articleStockId = '';
        this.datePeremption = null;
        this.lot = '';
        this.uniteId = '';
        this.qteS = 0;
        this.prixS = 0;
        this.pUMP = 0;
        this.prixVente = 0;
        this.pas = 0;
        this.qteSolde = 0;
        this.arrondi = 0;
        this.dateFabrication = null;
        this.dateCreation = null;
        this.userCreation = '';
        this.dateUpdate = null;
        this.userUpdate = '';
        this.pau = 0;
        this.prixTotal = 0;
        this.qteError = '';
        this.prixError = '';
    }
}

export class Service {
    serviceId: string;
    libelle: string;

    constructor() {
        this.serviceId = '';
        this.libelle = '';
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
    magasinId: string;
    libelle: string;
    sousCategorieId: string;
    conditionnement: string;
    uniteId: string;
    catalogue: string;
    qteStock: number;
    description: string;
    seuil: number;
    seuilMax: number;
    pUMP: number;
    pump: number;
    qtePhysique: number;
    consomme: number;
    prixVente: number;
    compteStock: string;
    compteCharge: string;
    peremption: boolean;
    lot: boolean;
    caseId: string;
    numeroOrdre: number;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: string;
    compteService: string;
    libelleCompte: string;
    codeDomaine: string;
    serviceId: string;

    constructor() {
        this.articleId = '';
        this.codeArticle = '';
        this.magasinId = '';
        this.libelle = '';
        this.sousCategorieId = '';
        this.conditionnement = '';
        this.uniteId = '';
        this.catalogue = '';
        this.qteStock = 0;
        this.description = '';
        this.seuil = 0;
        this.seuilMax = 0;
        this.pUMP = 0;
        this.pump = 0;
        this.qtePhysique = 0;
        this.consomme = 0;
        this.prixVente = 0;
        this.compteStock = '';
        this.compteCharge = '';
        this.peremption = false;
        this.lot = false;
        this.caseId = '';
        this.numeroOrdre = 0;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = '';
        this.compteService = '';
        this.libelleCompte = '';
        this.codeDomaine = '';
        this.serviceId = '';
    }
}

export class StkExercice {
    exerciceId: string;
    libelle: string;
    annee: string;
    magasinId: string;
    dateDebut: string;
    dateFin: string;
    dateOuverture: string;
    userOuverture: string;
    dateCloture: string;
    userCloture: string;

    constructor() {
        this.exerciceId = '';
        this.libelle = '';
        this.annee = '';
        this.magasinId = '';
        this.dateDebut = '';
        this.dateFin = '';
        this.dateOuverture = '';
        this.userOuverture = '';
        this.dateCloture = '';
        this.userCloture = '';
    }
}

export class StkMagasin {
    magasinId: string;
    nom: string;
    adresse: string;
    pointVente: boolean;
    type: number;

    constructor() {
        this.magasinId = '';
        this.nom = '';
        this.adresse = '';
        this.pointVente = false;
        this.type = 0;
    }
}

export class StkMagasinResponsable {
    magRespId: string;
    magasinId: string;
    responsableId: string;
    actif: boolean;

    constructor() {
        this.magRespId = '';
        this.magasinId = '';
        this.responsableId = '';
        this.actif = false;
    }
}

export class StkServiceResponsable {
    servRespId: string;
    serviceId: string;
    responsableId: string;
    actif: boolean;

    constructor() {
        this.servRespId = '';
        this.serviceId = '';
        this.responsableId = '';
        this.actif = false;
    }
}

export class StkDestination {
    pDestinationId: string;
    pLibelle: string;
    pCompte: string;

    constructor() {
        this.pDestinationId = '';
        this.pLibelle = '';
        this.pCompte = '';
    }
}