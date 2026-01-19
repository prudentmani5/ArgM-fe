export interface RapportConsommation {
    consommationId: string;
    matricule: string;
    nom: string;
    prenom: string;
    dateConsommation: Date;
    typeConsommation: string;
    partenaireId: string;
    libelle: string;
    prestationId: string;
    libellePrestation: string;
    articleId: string;
    libelleArticle: string;
    qte: number;
    pu: number;
    prixTotal: number;
    ayantDroit: number;
    nomAyantDroit: string;
}

export interface RapportConsommationGrouped {
    matricule: string;
    nomEmploye: string;
    totalConsommations: number;
    totalMontant: number;
    items: RapportConsommation[];
}

export interface RapportConsommationParams {
    dateDebut: Date;
    dateFin: Date;
    matricule?: string;
    partenaireId?: string;
}