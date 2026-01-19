export class StkEntree {
    entreeId: string;
    numeroPiece: string;
    magasinId: string;
    exerciceId: string;
    annee: string;
    typeMvtId: string;
    dateEntree: Date | null;
    magRespId: string;
    fournisseurId: string;
    montant: number;
    reference: string;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;

    constructor() {
        this.entreeId = '';
        this.numeroPiece = '';
        this.magasinId = '';
        this.exerciceId = '';
        this.annee = '';
        this.typeMvtId = '';
        this.dateEntree = null;
        this.magRespId = '';
        this.fournisseurId = '';
        this.montant = 0;
        this.reference = '';
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
    }
}

export class StkEntreeDetails {
    entreeDetailsId?: number;
    entreeId: string;
    numeroPiece: string;
    articleId: string;
    articleStockId: string;
    datePeremption: Date | null;
    lot: string;
    uniteId: string;  // Unité de l'article
    qteE: number;
    prixE: number;
    pump: number;
    prixVente: number;
    pau: number;
    qteSolde: number;
    arrondi: number;
    dateFabrication: Date | null;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpdate: string;

    constructor() {
        this.entreeDetailsId = 0;
        this.entreeId = '';
        this.numeroPiece = '';
        this.articleId = '';
        this.articleStockId = '';
        this.datePeremption = null;
        this.lot = '';
        this.uniteId = '';  // Initialisé à vide
        this.qteE = 0;
        this.prixE = 0;
        this.pump = 0;
        this.prixVente = 0;
        this.pau = 0;
        this.qteSolde = 0;
        this.arrondi = 0;
        this.dateFabrication = null;
        this.dateCreation = null;
        this.userCreation = '';
        this.dateUpdate = null;
        this.userUpdate = '';
    }
}

// Classes pour les dropdowns
export class Fournisseur {
    fournisseurId: string;
    nom: string;
    adresse: string;
    bp: string;
    tel: string;
    email: string;
    local: boolean;
    compte: string;
    donateur: boolean;
    magasinId: string;

    constructor() {
        this.fournisseurId = '';
        this.nom = '';
        this.adresse = '';
        this.bp = '';
        this.tel = '';
        this.email = '';
        this.local = false;
        this.compte = '';
        this.donateur = false;
        this.magasinId = '';
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