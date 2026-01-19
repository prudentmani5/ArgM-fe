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
    datesGroups: DateGroup[];
}

export interface DateGroup {
    datePaiement: Date;
    total: number;
    items: RapportTotalBanque[];
}