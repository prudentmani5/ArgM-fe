export interface ValidRemorquage {
    noRemorque: string;
    lettreTransp: string;
    bargeId: string | null;
    longeur: number | null;
    largeur: number | null;
    tirant: number | null;
    dateDebut: Date | null;
    dateFin: Date | null;
    montant: number | null;
    importateurId: number | null;
    manoeuvre: number | null;
    declarant: string;
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
    userAnnulation: string;
    dateEnvoiOBR?: Date | null;
    statusEnvoiOBR?: number | null;
    statusEnvoiCancelOBR?: number | null;
    annuleFacture?: number | boolean;
}

export class RemorquageValidationRequest {
    lettreTransp: string;
    isValid: boolean;
    
    constructor(lettreTransp: string, isValid: boolean) {
        this.lettreTransp = lettreTransp;
        this.isValid = isValid;
    }
}