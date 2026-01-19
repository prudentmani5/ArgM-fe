// FicheStock.ts
export interface FicheStockItem {
  date: Date;
  referencePiece: string;
  articleLibelle: string;
  catalogue: string;
  origine: string;
  entreesQte?: number;
  entreesPU?: number;
  entreesPT?: number;
  sortiesQte?: number;
  sortiesPU?: number;
  sortiesMontant?: number;
  disponibleQte: number;
  disponiblePU?: number;
  disponibleMontant?: number;
  type: 'ENTREE' | 'SORTIE' | 'SOLDE_INITIAL';
  cumulatifQte?: number;  // Optionnel
}

export interface FicheStockParams {
  dateDebut: Date;
  dateFin: Date;
  articleId: string;
  magasinId?: string;
}

export interface FicheStockData {
  articleId: string;
  articleLibelle: string;
  catalogue: string;
  uniteLibelle: string;
  qteStockInitial: number;
  pumpInitial: number;
  mouvements: FicheStockItem[];
  soldeFinal: {
    qte: number;
    pump: number;
    montant: number;
  };
}