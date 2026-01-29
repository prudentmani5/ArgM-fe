// RapportEntrees.ts (mis à jour)
export interface RapportEntree {
    entreeId: string;
    numeroPiece: string;
    dateEntree: Date;
    magasinId: string;
    magasinNom: string;
    typeMvtId: string;
    typeMvtLibelle: string;
    fournisseurId?: string;
    fournisseurNom?: string;
    montant: number;
    reference: string;
    userCreation: string;
    dateCreation: Date;
    
    // Détails intégrés
    entreeDetailsId?: number;
    articleId?: string;
    articleLibelle?: string;
    articleCategorieId?: string;
    articleCategorieNom?: string;
    sousCategorieId?: string;
    sousCategorieNom?: string;
    uniteId?: string;
    uniteLibelle?: string;
    qteE?: number;
    prixE?: number;
    prixTotal?: number;
    lot?: string;
    datePeremption?: Date | null;
    dateFabrication?: Date | null;
    pump?: number;
    pau?: number;
}

export interface RapportEntreeGrouped {
    numeroPiece: string;
    dateEntree: Date;
    totalEntrees: number;
    totalMontant: number;
    items: RapportEntree[];
}

export interface RapportEntreeCategorieGroup {
    categorieId: string;
    categorieNom: string;
    totalArticles: number;
    totalMontant: number;
    sousCategories?: RapportEntreeSousCategorieGroup[];
    items: RapportEntree[];
}

export interface RapportEntreeSousCategorieGroup {
    sousCategorieId: string;
    sousCategorieNom: string;
    totalArticles: number;
    totalMontant: number;
    items: RapportEntree[];
}

export interface RapportEntreeParams {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece?: string;
    magasinId?: string;
    fournisseurId?: string;
}