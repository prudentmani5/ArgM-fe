// MouvementStock.ts - CORRIGÉ
export interface MouvementStockItem {
  numeroPiece: string;
  nomArticle: string;
  categorie: string;
  catalogue: string;
  sousCategorie: string;
  magasinId?: string;
  magasinNom?: string;
  magasin?: {
    magasinId?: string;
    nom?: string;
  };
  situationInitiale: {
    qte: number;
    montant: number;
  };
  entrees: {
    qte: number;
    montant: number;
  };
  sorties: {
    qte: number;
    montant: number;
  };
  stock: {
    qte: number;
    puStock: number;
    montant: number;
  };
}

// INTERFACE CORRIGÉE POUR LE GROUPEMENT
export interface MouvementStockGrouped {
  groupKey: string;
  categorie: string;
  magasin: string;
  magasinId?: string;
  totalArticles: number;
  totalSituationInitiale: {
    qte: number;
    montant: number;
  };
  totalEntrees: {
    qte: number;
    montant: number;
  };
  totalSorties: {
    qte: number;
    montant: number;
  };
  totalStock: {
    qte: number;
    montant: number;
  };
  items: MouvementStockItem[];
}

export interface MouvementStockParams {
  dateDebut: Date;
  dateFin: Date;
  magasinId?: string;
  categorieId?: string;
}

export interface MouvementStockData {
  periode: string;
  mouvements: MouvementStockItem[];
  totalEntrees: {
    qte: number;
    montant: number;
  };
  totalSorties: {
    qte: number;
    montant: number;
  };
  stockFinal: {
    qte: number;
    montant: number;
  };
}
