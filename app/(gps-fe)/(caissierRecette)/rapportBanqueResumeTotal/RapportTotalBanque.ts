export interface RapportTotalBanque {
    paiementId: string;
    factureId: string;
    type: string;
    modePaiement: string;
    banqueId: number;
    compteBanqueId: number;
    clientId: number;
    importateurCreditId: string;
    montantPaye: number;
    montantExcedent: number;
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
    libelleBanque: string;
    sigleBanque: string;
}

export interface RapportBanqueGroup {
    nomBanque: string;
    total: number;
    totalFacture: number;
    totalExcedent: number;
    modePayementGroups: ModePayementGroup[];
}

export interface ModePayementGroup {
    modePayement: string;
    total: number;
    totalFacture: number;
    totalExcedent: number;
    items: RapportTotalBanque[];
}