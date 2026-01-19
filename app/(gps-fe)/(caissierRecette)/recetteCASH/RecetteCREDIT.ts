export interface RecetteCREDIT {
    recetteId: number;
    numCompte: string;
    libelle: string;
    montantTT: number;
    montantExo: number;
    dateSaisie: Date;
}

export interface RecetteCREDITGrouped {
    libelle: string;
    totalTT: number;
    totalExo: number;
    items: RecetteCREDIT[];
}

export interface Importateur {
    importateurCreditId: String;
    nom: string;
}