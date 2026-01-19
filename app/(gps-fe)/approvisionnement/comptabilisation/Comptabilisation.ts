// interfaces/Comptabilisation.ts
export interface Comptabilisation {
    comptabilisationId: number;
    numeroPiece: string;
    compte: string;
    libelle: string;
    reference: string;
    dateEcriture: Date;
    debit: number;
    credit: number;
}

export interface ComptabilisationGrouped {
    libelle: string;
    totalDebit: number;
    totalCredit: number;
    items: Comptabilisation[];
}

export interface ComptabilisationApproRequest {
    magasin: string;
    dateDebut: Date;
    dateFin: Date;
    numeroPiece: string;
    codeJournal: string;
    dossierId?: string;
    brouillard?: string;
}

export interface TransferParams {
    annee: string;
    dossierId: string;
    dateDebut: Date;
    dateFin: Date;
    codeJournal: string;
    brouillard: string;
    numeroPiece: number;
    dateTransfert: Date;
}