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
    uniteId?: string;
    uniteLibelle?: string;
    qteS?: number;
    prixS?: number;
    prixTotal?: number;
    lot?: string;
    datePeremption?: Date | null;
    ayantDroit?: string;
    matricule?: string;
    
    // Nouveaux champs de destination
    destinationId?: string;
    destinationLibelle?: string;
    destinationCompte?: string;
}


// RapportSorties.ts
/*export interface RapportSortieGrouped {
    numeroPiece: string;
    dateSortie: Date;
    destinationLibelle?: string; // Ajouter cette ligne
    totalSorties: number;
    totalMontant: number;
    items: RapportSortie[];
}*/

export interface RapportSortieGrouped {
    destinationLibelle: string;
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
    destinationId?: string; // Ajout du filtre par destination
}