// types/FacSaisieUser.ts
export interface FacSaisieUser {
    saisieUserId: number;
    factureId: string;
    rsp: string;
    lt: string;
    userId: string;
    dateSaisie: String;
    declarant: string;
    montant: number;
    htva: number;
    tva: number;
    marchandise: string;
    client: string;
}