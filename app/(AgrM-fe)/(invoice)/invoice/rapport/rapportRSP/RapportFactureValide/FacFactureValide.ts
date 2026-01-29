// types/FacFactureValide.ts
export interface FacFactureValide {
    factureValideId: number;
    numFacture: string;
    nomClient: string;
    nomMarchandise: string;
    montantHorsTVA: number;
    tva: number;
    montantTotal: number;
    userValidation: string;
    dateValidation: string;
}
