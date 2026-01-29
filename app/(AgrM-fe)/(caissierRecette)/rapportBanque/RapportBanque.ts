export interface RapportBanque {
    paiementId: string;
    factureId: string;
    type: string;
    modePaiement: string;
    banqueId: number;
    compteBanqueId: number;
    clientId: number;
    importateurCreditId: string;
    montantPaye: number;
    datePaiement: Date;
    caissierId: number;
    reference: string;
    rsp: string;
    lSuivre: boolean;
    annee: string;
    credit: boolean;
    montantTVA: number;
    montantHTVA: number;
    nomClient: string;
    nomCaissier: string;
    nomBanque: string;
    libelleBanque: string;
}

export interface RapportBanqueGrouped {
    libelleBanque: string;
    total: number;
    items: RapportBanque[];
}

export interface Banque {
    banqueId: number;
    libelleBanque: string;  // Au lieu de nomBanque
    sigle: string;          // Au lieu de codeBanque
    compte?: string;
}