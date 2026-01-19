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
    
    // Détails intégrés (nouveaux champs)
    sortieDetailsId?: number;
    articleId?: string;
    articleLibelle?: string;
    uniteId?: string;
    uniteLibelle?: string;
    qteS?: number;
    prixS?: number;
    prixTotal?: number;
    lot?: string;
    datePeremption?: Date | null;
    ayantDroit?: string;
    matricule?: string;
}

export interface RapportSortieGrouped {
    serviceId: string;
    serviceLibelle: string;
    dateSortie: Date; // Gardé pour référence
    totalSorties: number;
    totalMontant: number;
    items: RapportSortie[];
}

export interface RapportSortieParams {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece?: string;
    magasinId?: string;
    serviceId?: string;
}