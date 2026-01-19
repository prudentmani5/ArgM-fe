// StkConsommation.ts
export default class StkConsommation {
    consommationId: string;
    matricule: string;
    refBonCommande: string;
    dateConsommation: Date | null;
    typeConsommation: string;
    numeroOrdre: number;
    exercice: number;
    dateConsommationD:Date | null

    constructor() {
        this.consommationId = '';
        this.matricule = '';
        this.refBonCommande = '';
        this.dateConsommation = null;
        this.typeConsommation = '';
        this.numeroOrdre = 0;
        this.exercice = 0;
        this.dateConsommationD =null
    }
}

export class StkConsommationDetails {
    consommationDetailsId?: number;
    consommationId: string;
    partenaireId: string;
    prestationId: string;
    qte: number;
    pu: number;
    prixTotal: number;
    ayantDroit: number;
    articleId: string;

    constructor() {
        this.consommationDetailsId = 0;
        this.consommationId = '';
        this.partenaireId = '';
        this.prestationId = '';
        this.qte = 0;
        this.pu = 0;
        this.prixTotal = 0;
        this.ayantDroit = 0;
        this.articleId = '';
    }
}

// Classes pour les dropdowns
export class StkEmploye {
    matriculeId: string;
    nom: string;
    prenom: string;
   /* sexe: string;
    dept: string;
    actif: string;
    conjointSalarie: boolean;
    pourcentageEmploye: number;
    pourcentageConjoint: number;
    pourcentageEnfant: number;
    pourcentageAutre: number;
*/
    constructor() {
        this.matriculeId = '';
        this.nom = '';
        this.prenom = '';
        /* this.sexe = '';
        this.dept = '';
        this.actif = '';
        this.conjointSalarie = false;
        this.pourcentageEmploye = 0;
        this.pourcentageConjoint = 0;
        this.pourcentageEnfant = 0;
        this.pourcentageAutre = 0;
        */
    }
}

export class StkPartenaire {
    partenaireId: string;
    libelle: string;

    constructor() {
        this.partenaireId = '';
        this.libelle = '';
    }
}

export class StkPrestation {
    prestationId: string;
    libellePrestation: string;
    typePrestationId: string;
    pu: number;
    numeroOrdre: number;

    constructor() {
        this.prestationId = '';
        this.libellePrestation = '';
        this.typePrestationId = '';
        this.pu = 0;
        this.numeroOrdre = 0;
    }
}

export class GrhRensAyantDroit {
    rensAyantDroitId: number;
    matriculeId: number;
    categorie: string;
    nom: string;
    prenom: string;
    dateNaissance: Date | null;
    dateMariage: Date | null;
    dateDivorce: Date | null;
    dateDeces: Date | null;
    priseEnCharge: boolean;
    refExtraitActeNaissance: string;
    refExtraitActeMariage: string;
    refCertificatDeces: string;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;

    constructor() {
        this.rensAyantDroitId = 0;
        this.matriculeId = 0;
        this.categorie = '';
        this.nom = '';
        this.prenom = '';
        this.dateNaissance = null;
        this.dateMariage = null;
        this.dateDivorce = null;
        this.dateDeces = null;
        this.priseEnCharge = false;
        this.refExtraitActeNaissance = '';
        this.refExtraitActeMariage = '';
        this.refCertificatDeces = '';
        this.userCreation = '';
        this.dateCreation = null;
        this.userUpdate = '';
        this.dateUpdate = null;
    }
}

export class StkArticle {
    articleId: string;
    codeArticle: string;
    libelle: string;
    qteStock: number;
    pump: number;
    prixVente: number;

    constructor() {
        this.articleId = '';
        this.codeArticle = '';
        this.libelle = '';
        this.qteStock = 0;
        this.pump = 0;
        this.prixVente = 0;
    }
}