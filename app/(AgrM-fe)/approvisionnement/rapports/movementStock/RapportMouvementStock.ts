// Types pour le rapport de mouvement de stock

export interface StockMovementItem {
    articleStockId: string;
    articleId: string;
    articleLibelle: string;
    categorieId: string;
    categorieLibelle: string;
    magasinId: string;
    magasinNom: string;
    
    // Situation initiale
    qteInitiale: number;
    montantInitial: number;
    
    // Entrées
    qteEntrees: number;
    montantEntrees: number;
    
    // Sorties
    qteSorties: number;
    montantSorties: number;
    
    // Stock final
    qteStock: number;
    prixUnitaireStock: number;
    montantStock: number;
}

export interface CategorieGroup {
    categorieLibelle: string;
    items: StockMovementItem[];
    totalInitial: number;
    totalEntrees: number;
    totalSorties: number;
    totalStock: number;
}
