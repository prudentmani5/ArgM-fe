export default interface Comptabilisation {
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

export interface ComptabilisationRequest {
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

export interface AchatTransfert {
    numeroPiece: string;
    compteCategorie: string;
    reference: string;
    dateEcriture: string;
    debit: number;
    credit: number;
    libelleCategorie: string;
    montant: number;
    nomFournisseur: string;
    compteFournisseur: string;
    dateEntree: string;
    dateSortie: string;
    articleId: string;
    coutAchat: number;
    libelleArticle: string;
    compteChargeArticle: string;
    compteStockArticle: string;
    pau: number;
    quantite: number;
}