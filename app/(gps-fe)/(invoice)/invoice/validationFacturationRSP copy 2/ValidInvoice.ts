export interface ValidInvoice {
    factureSortieId: number | null;
    sortieId: string;
    numFacture: string;
    rsp: string;
    lt: string;
    montTotalManut: number | null;
    montTVA: number | null;
    montantPaye: number | null;
    dateSortie: Date | null;
    nomClient: string;
    nomMarchandise: string;
    isValid: Number;
    dateValidation: Date | null;
    userValidation: string;
    declarant: string;
    manutBateau: number | null;
    manutCamion: number | null;
    surtaxeColisLourd: number | null;
    montSalissage: number | null;
    montArrimage: number | null;
    montRedev: number | null;
    montPalette: number | null;
    montPesMag: number | null;
    montLais: number | null;
    peage: number | null;
    montEtiquette: number | null;
    montFixationPlaque: number | null;
    montMagasinage: number | null;
    montGardienage: number | null;
    montFixeTVA: number | null;
    dateAnnulation:number | null;
    userAnnulation: string
    dateEntree: Date | null; // Ajouter cette ligne
    typeConditionId: string;
    typeFacture: string;
    duree: number
    duree37: number
    montPrixMagasin: number,
    montPrixMagasin37:  number,
    tonnage: number,
    nbreColis: number,
    dateSupplement: Date | null,
    dateDerniere: Date | null
    statutEncaissement: string;
    tarifBarge: number,
    tarifCamion: number,
    fraisSrsp: number,// salissage
    fraisArrimage: number,//Arrimage
    SurtaxeClt: number, //colis lourd
    
    
}

export class InvoiceValidationRequest {
    sortieId: string;
    rsp: string;
    isValid: boolean;

    constructor(sortieId: string, rsp: string, isValid: boolean) {
        this.sortieId = sortieId;
        this.rsp = rsp;
        this.isValid = isValid;
    }
}