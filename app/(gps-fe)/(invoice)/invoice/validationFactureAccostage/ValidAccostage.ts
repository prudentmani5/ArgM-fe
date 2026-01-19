export interface ValidAccostage {
    noArrive: string;
    lettreTransp: string;
    bargeId: number | null;
    longeur: number | null;
    dateArrive: Date | null;
    dateDepart: Date | null;
    taxeAccostage: number | null;
    taxeManut: number | null;
    declarant: string;
    importateurId: number | null;
    userCreation: string;
    dateCreation: Date | null;
    valide1: boolean | null;
    valide2: boolean | null;
    userValide1: string;
    userValide2: string;
    userUpdate: string;
    dateUpdate: Date | null;
    dossierId: string;
    modePayement: string;
    isValid: boolean | null;
    dateValidation: Date | null;
    montantRedev: number | null;
    montRedevTaxe: number | null;
    montTVA: number | null;
    nbreBateau: number | null;
    refAnnule: string;
    numeroOrdre: number | null;
    factureSignature: string;
    motifAnnulation: string;
    nomImportateur: string;
    nomBarge: string;
    dateAnnulation: Date | null;
    userAnnulation: string,
    tonageArrive:number | null;
    tonageDepart:number | null;
    dateEnvoiOBR?: Date | null;
    statusEnvoiOBR?: number | null;
    statusEnvoiCancelOBR?: number | null;
    annuleFacture?: number | boolean;
}

export class AccostageValidationRequest {
    lettreTransp: string;
    isValid: boolean;
    

    constructor(lettreTransp: string, isValid: boolean) {
        this.lettreTransp = lettreTransp;
        this.isValid = isValid;
    }
}