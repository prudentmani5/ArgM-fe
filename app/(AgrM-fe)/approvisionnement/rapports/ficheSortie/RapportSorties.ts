// RapportSorties.ts
export interface RapportSortie {
    sortieId: string;
    numeroPiece: string;
    dateSortie: Date;
    magasinId: string;
    magasinNom: string;
    typeMvtId: string;
    typeMvtLibelle: string;
    serviceId: string;
    serviceLibelle: string;
    montant: number;
    reference: string;
    userCreation: string;
    dateCreation: Date;
    
    // Détails intégrés
    sortieDetailsId?: number;
    articleId?: string;
    articleLibelle?: string;
    articleCategorieId?: string;
    articleCategorieNom?: string;
    sousCategorieId?: string;
    sousCategorieNom?: string;
    uniteId?: string;
    uniteLibelle?: string;
    qteS?: number;
    prixS?: number;
    prixTotal?: number;
    lot?: string;
    datePeremption?: Date | null;
    dateFabrication?: Date | null;
    ayantDroit?: string;
    matricule?: string;
}

export interface RapportSortieGrouped {
    numeroPiece: string;
    dateSortie: Date;
    totalSorties: number;
    totalMontant: number;
    items: RapportSortie[];
}

export interface RapportSortieCategorieGroup {
    categorieId: string;
    categorieNom: string;
    totalArticles: number;
    totalQuantite: number;
    totalMontant: number;
    sousCategories?: RapportSortieSousCategorieGroup[];
    items: RapportSortieAggrege[];
}

export interface RapportSortieSousCategorieGroup {
    sousCategorieId: string;
    sousCategorieNom: string;
    totalArticles: number;
    totalQuantite: number;
    totalMontant: number;
    items: RapportSortieAggrege[];
}

export interface RapportSortieAggrege {
    articleId: string;
    articleLibelle: string;
    uniteId: string;
    uniteLibelle: string;
    totalQuantite: number;
    prixMoyen: number;
    totalMontant: number;
    nombreSorties: number;
    sousCategorieId?: string;
    sousCategorieNom?: string;
    detailsOrigine: RapportSortie[];
}

export interface RapportSortieParams {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece?: string;
    magasinId?: string;
    serviceId?: string;
    destinationId?: string;
}