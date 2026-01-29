export interface FacServicePreste {
    servicePresteId: number | null;
    numFacture: string;
    serviceId: number | null;
    importateurId: number | null;
    date: Date | null;
    lettreTransp: string;
    montant: number | null;
    peage: number | null;
    pesage: number | null;
    taxe: boolean | null; // Ce sera notre "check exonéré"
    montTaxe: number | null;
    montRedev: number | null;
    montRedevTaxe: number | null;
    tauxChange: number | null;
    montantDevise: number | null;
    pac: string;
    typeVehicule: string;
    plaque: string;
    pesageVide: number | null;
    redPalette: number | null;
    noCont: string;
    nbreCont: number | null;
    poids: number | null;
    dateDebut: Date | null;
    dateFin: Date | null;
    supplement: boolean;
    dateSupplement: Date | null;
    declarant: string;
    valide1: boolean;
    valide2: boolean;
    userValide1: string;
    userValide2: string;
    userCreation: string;
    dateCreation: Date | null;
    userUpdate: string;
    dateUpdate: Date | null;
    facture: boolean | null;
    dossierId: string;
    modePayement: string;
    isValid: boolean | null;
    dateValidation: Date | null;
    refAnnule: string;
    numeroOrdre: number | null;
    factureSignature: string;
    motifAnnulation: string;
    annuleFacture: boolean | null;
    dateAnnulation: Date | null;
    signatureCrypt: string;
    dateEnvoiOBR: Date | null;
    statusEnvoiOBR: number | null;
    statusEnvoiCancelOBR?: number | null;
    userAnnulation: string;
    nomImportateur: string;
    nomService: string;
}

export class ServicePresteValidationRequest {
    numFacture: string;
    lettreTransp: string;
    isValid: boolean;
    taxe: boolean; // Check exonéré
    montRedev:number;
    

    constructor(numFacture: string, lettreTransp: string, isValid: boolean, taxe: boolean,montRedev:number) {
        this.numFacture = numFacture;
        this.lettreTransp = lettreTransp;
        this.isValid = isValid;
        this.taxe = taxe;
        this.montRedev=montRedev
    }
}