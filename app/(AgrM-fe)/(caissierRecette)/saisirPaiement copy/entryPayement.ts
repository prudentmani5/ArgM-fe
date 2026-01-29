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
    nomClient:string; 
    fullName:string; 

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
        this.datePaiement = null;
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
        this.fullName='';
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
    importateurCreditId: string;
    nom: string;
    importateurId: number | undefined;

    constructor() {
        this.importateurCreditId = '';
        this.nom = '';
    }
}

export class AccostageCaisse {
    noArrive: string;
    importateurId: number;
    nom: string;
    montantPaye: number;
    lettreTransp:string

    constructor() {
        this.noArrive = '';
        this.importateurId = 0;
        this.nom = '';
        this.montantPaye = 0;
        this. lettreTransp = '';
    }
}