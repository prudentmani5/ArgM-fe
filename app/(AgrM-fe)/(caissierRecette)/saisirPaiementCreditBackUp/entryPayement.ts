export class EntryPayement {
    paiementId: string | null;
    factureId: string | null;
    type: string | null;
    modePaiement: string | null;
    banqueId: number | null;
    compteBanqueId: number | null;
    clientId: number | null;
    importateurCreditId: string | null;
    montantPaye: number | null;
    datePaiement: Date | null;
    caissierId: number | null;
    reference: string | null;
    rsp: string | null;
    lSuivre: boolean;
    annee: string | null;
    credit: boolean;
    montantTVA: number | null;
    montantHTVA: number | null;

    constructor() {
        this.paiementId = null;
        this.factureId = null;
        this.type = null;
        this.modePaiement = null;
        this.banqueId = null;
        this.compteBanqueId = null;
        this.clientId = null;
        this.importateurCreditId = null;
        this.montantPaye = null;
        this.datePaiement = null;
        this.caissierId = null;
        this.reference = null;
        this.rsp = null;
        this.lSuivre = false;
        this.annee = null;
        this.credit = false;
        this.montantTVA = null;
        this.montantHTVA = null;
    }
}

export class Bank {
    banqueId: number | null;
    sigle: string | null;
    libelleBanque: string | null;
    compte: string | null;

    constructor() {
        this.banqueId = null;
        this.sigle = null;
        this.libelleBanque = null;
        this.compte = null;
    }
}

export class CompteBanque {
    compteBanqueId: number | null;
    numeroCompte: string | null;
    banqueId: number | null;
    deviseId: number | null;

    constructor() {
        this.compteBanqueId = null;
        this.numeroCompte = null;
        this.banqueId = null;
        this.deviseId = null;
    }
}

export class ImportateurCredit {
    importateurCreditId: string | null;
    nom: string | null;

    constructor() {
        this.importateurCreditId = null;
        this.nom = null;
    }
}

export class Caissier {
    caissierId: number | null;
    nomPrenom: string | null;
    fonction: string | null;

    constructor() {
        this.caissierId = null;
        this.nomPrenom = null;
        this.fonction = null;
    }
}

export class Importer {
    importateurId: number | null;
    nom: string | null;
    adresse: string | null;
    tel: string | null;
    fax: string | null;
    compteDebit: string | null;
    facture: boolean;
    compteCredit: string | null;
    nif: string | null;
    email: string | null;
    assujetiTVA: number | null;
    actif: boolean;

    constructor() {
        this.importateurId = null;
        this.nom = null;
        this.adresse = null;
        this.tel = null;
        this.fax = null;
        this.compteDebit = null;
        this.facture = false;
        this.compteCredit = null;
        this.nif = null;
        this.email = null;
        this.assujetiTVA = null;
        this.actif = false;
    }
}

export class Invoice {
    factureSortieId: number | null;
    sortieId: string | null;
    numFacture: string | null;
    rsp: string | null;
    lt: string | null;
    manutBateau: number | null;
    manutCamion: number | null;
    surtaxeColisLourd: number | null;
    montSalissage: string | null;
    montArrimage: number | null;
    montRedev: number | null;
    montPalette: number | null;
    montPesMag: number | null;
    montLais: number | null;
    peage: number | null;
    montEtiquette: number | null;
    montFixationPlaque: number | null;
    montTotalManut: number | null;
    montMagasinage: number | null;
    montGardienage: number | null;
    montTVA: number | null;
    montantPaye: number | null;
    dateSortie: Date | null;
    userCreation: string | null;
    marchandiseId: number | null;
    clientId: number | null;
    exonere: boolean;
    declarant: string | null;
    dossierId: string | null;
    modePayement: string | null;
    isValid: boolean;
    dateValidation: Date | null;
    refAnnule: string | null;
    numeroOrdre: number | null;
    annule: boolean;
    montantReduction: number | null;
    tauxReduction: number | null;
    factureSignature: string | null;
    motifAnnulation: string | null;
    DateAnnulation: Date | null;
    annuleFacture: boolean;
    UserAnnulation: string | null;

    constructor() {
        this.factureSortieId = null;
        this.sortieId = null;
        this.numFacture = null;
        this.rsp = null;
        this.lt = null;
        this.manutBateau = null;
        this.manutCamion = null;
        this.surtaxeColisLourd = null;
        this.montSalissage = null;
        this.montArrimage = null;
        this.montRedev = null;
        this.montPalette = null;
        this.montPesMag = null;
        this.montLais = null;
        this.peage = null;
        this.montEtiquette = null;
        this.montFixationPlaque = null;
        this.montTotalManut = null;
        this.montMagasinage = null;
        this.montGardienage = null;
        this.montTVA = null;
        this.montantPaye = null;
        this.dateSortie = null;
        this.userCreation = null;
        this.marchandiseId = null;
        this.clientId = null;
        this.exonere = false;
        this.declarant = null;
        this.dossierId = null;
        this.modePayement = null;
        this.isValid = false;
        this.dateValidation = null;
        this.refAnnule = null;
        this.numeroOrdre = null;
        this.annule = false;
        this.montantReduction = null;
        this.tauxReduction = null;
        this.factureSignature = null;
        this.motifAnnulation = null;
        this.DateAnnulation = null;
        this.annuleFacture = false;
        this.UserAnnulation = null;
    }
}