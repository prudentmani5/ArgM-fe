export interface ComptabilisationResult {
  entreesGenerees: boolean;
  sortiesGenerees: boolean;
  messageEntree: string;
  messageSortie: string;
  messageGlobal: string;
}

export interface AchatTransfert {
  numeroPiece?: string;
  compteCategorie: string;
  libelleCategorie?: string;
  reference?: string;
  dateEcriture?: string;
  debit?: number;
  credit?: number;
  montant?: number;
}

export interface TransfertParams {
  dateDebut: Date;
  dateFin: Date;
  numeroPiece: string;
  dossierId: string;
  codeJournal: string;
  brouillard: string;
  annee: string;
}