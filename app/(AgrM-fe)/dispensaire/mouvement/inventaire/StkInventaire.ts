// StkInventaire.ts
export default class StkInventaire {
    inventaireId: string;
    numeroPiece: string;
    magasinId: string;
    exerciceId: string;
    dateInventaire: Date | null;
    magrespId: string;
    libelle: string;
    montant: number;
    isValid: boolean;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;

    constructor() {
        this.inventaireId = '';
        this.numeroPiece = '';
        this.magasinId = '';
        this.exerciceId = '';
        this.dateInventaire = null;
        this.magrespId = '';
        this.libelle = '';
        this.montant = 0;
        this.isValid = false;
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
    }
}

export class StkInventaireDetails {
    inventaireDetailsId: number;
    articleStockId: string;
    articleId: string;
    inventaireId: string;
    quantitePhysique: number;
    prixUnitaire: number;
    uniteId: string;
    catalogue: string;
    datePeremption: Date | null;
    lot: string;
    quantiteTheorique: number;
    numeroPiece: string;
    prix: number;
    prixTotal: number;

    constructor() {
        this.inventaireDetailsId = 0;
        this.articleStockId = '';
        this.articleId = '';
        this.inventaireId = '';
        this.quantitePhysique = 0;
        this.prixUnitaire = 0;
        this.uniteId = '';
        this.catalogue = '';
        this.datePeremption = null;
        this.lot = '';
        this.quantiteTheorique = 0;
        this.numeroPiece = '';
        this.prix = 0;
        this.prixTotal = 0;
    }
}

// Classes pour les dropdowns
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

export class StkArticle {
    articleId: string;
    codeArticle: string;
    libelle: string;
    qteStock: number;
    pump: number;
    prixVente: number;
    uniteId: string;

    constructor() {
        this.articleId = '';
        this.codeArticle = '';
        this.libelle = '';
        this.qteStock = 0;
        this.pump = 0;
        this.prixVente = 0;
        this.uniteId = '';
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