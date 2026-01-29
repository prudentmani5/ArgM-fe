export interface RapportCaissier {
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
}

export interface RapportCaissierGrouped {
    nomBanque: string;
    total: number;
    items: RapportCaissier[];
}

export interface Caissier {
    importateurId: number;
    //nomPrenom: string;
    //fonction: string;
      nom:string;

}