export class EntryPayement {
    paiementId: string;
    factureId: string;
    type: string;
    modePaiement: string;
    banqueId: number | 0;
    compteBanqueId: number | 0;
    clientId: number | 0;
    importateurCreditId: string | '';
    montantPaye: number | 0;
    montantExcedent: number | 0; // NOUVEAU CHAMP
    datePaiement: Date | null;
    caissierId: number | 0;
    reference: string;
    rsp: string;
    lSuivre: boolean;
    annee: string;
    credit: boolean;
    montantTVA: number | 0;
    montantHTVA: number | 0;
    clientNom: string; 
    nomClient: string; 
    fullName: string; 
    userCreation: string; 

    constructor() {
        this.paiementId = '';
        this.factureId = '';
        this.type = '';
        this.modePaiement = '';
        this.banqueId = 0;
        this.compteBanqueId = 0;
        this.clientId = 0;
        this.importateurCreditId = '';
        this.montantPaye = 0;
        this.montantExcedent = 0; // Initialisé à 0
        this.datePaiement = new Date();
        this.caissierId = 0;
        this.reference = '';
        this.rsp = '';
        this.lSuivre = false;
        this.annee = '';
        this.credit = false;
        this.montantTVA = 0;
        this.montantHTVA = 0;
        this.clientNom = '';
        this.nomClient = '';
        this.fullName = '';
        this.userCreation = '';
    }
}

export class Bank {
    banqueId: number;
    sigle: string;
    libelleBanque: string;
    compte: string;

    constructor() {
        this.banqueId = 0;
        this.sigle = '';
        this.libelleBanque = '';
        this.compte = '';
    }
}

export class CompteBanque {
    compteBanqueId: number;
    numeroCompte: string;
    banqueId: number;
    deviseId: number;

    constructor() {
        this.compteBanqueId = 0;
        this.numeroCompte = '';
        this.banqueId = 0;
        this.deviseId = 0;
    }
}

export class ImportateurCredit {
    importateurCreditId: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;

    constructor() {
        this.importateurCreditId = 0;
        this.nom = '';
        this.prenom = '';
        this.telephone = '';
        this.email = '';
        this.adresse = '';
    }
}