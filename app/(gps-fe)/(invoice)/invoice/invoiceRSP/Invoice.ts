export class Invoice
 {
    factureSortieId: number | null;
    sortieId: string | null;
    numFacture: string;
    rsp: string;
    lt: string;
    manutBateau: number | null;
    manutCamion: number | null;
    surtaxeColisLourd: number | null;
    montSalissage: number;
    montArrimage: number | null;
    montRedev: number | null;
    montPalette: number | null;
    montPesMag: number | null;
    montLais: number | null;
    peage: number | null;
    montEtiquette: number | null;
    montFixationPlaque: number | null;
    montTotalManut: number | null;
    montMagasinage: number | null;
    montGardienage: number | null;
    montTVA: number | null;
    montFixeTVA: number | null;
    montantPaye: number | null;
    dateSortie: Date | null;
    userCreation: string;
    marchandiseId: number | null;
    clientId: number | null;
    exonere: boolean;
    declarant: string;
    dossierId: string;
    modePayement: string;
    isValid: boolean;
    dateValidation: Date | null;
    refAnnule: string;
    numeroOrdre: number | null;
    annule: boolean;
    montantReduction: number | null;
    tauxReduction: number | null;
    factureSignature: string;
    motifAnnulation: string;
    fixationPlaque: boolean;
    nomClient:String;
    nomMarchandise:String;
    montantFixationPlaque:number;
    duree: number;
    duree37: number;
    tonnageArrondi:number;
    tonnage:number;
    dateSupplement: Date | null;
    dateDerniereSortie: Date | null;
    nbreColis: number;
    etiquete: boolean;
    
    constructor() {
        this.factureSortieId = null;
        this.sortieId = null;
        this.numFacture = '';
        this.rsp = '';
        this.lt = '';
        this.manutBateau = null;
        this.manutCamion = null;
        this.surtaxeColisLourd = null;
        this.montSalissage = 0;
        this.montArrimage = null;
        this.montRedev = null;
        this.montPalette = null;
        this.montPesMag = null;
        this.montLais = null;
        this.peage = null;
        this.montEtiquette = null;
        this.montFixationPlaque = 0;
        this.montTotalManut = null;
        this.montMagasinage = null;
        this.montGardienage = null;
        this.montTVA = null;
        this.montFixeTVA = null;
        this.montantPaye = null;
        this.dateSortie = null;
        this.dateSupplement= null;
        this.dateDerniereSortie= null;
        this.userCreation = '';
        this.marchandiseId = null;
        this.clientId = null;
        this.exonere = false;
        this.declarant = '';
        this.dossierId = '';
        this.modePayement = '';
        this.isValid = false;
        this.dateValidation = null;
        this.refAnnule = '';
        this.numeroOrdre = null;
        this.annule = false;
        this.montantReduction = null;
        this.tauxReduction = null;
        this.factureSignature = '';
        this.motifAnnulation = '';
        this.fixationPlaque =false;
        this.nomClient='';
        this.nomMarchandise='';
        this.montantFixationPlaque=0;
        this.duree = 0;
        this.duree37 = 0;
        this.tonnageArrondi=0;
        this.tonnage=0
        this. nbreColis= 0;
        this.etiquete = false;
    }
}

export class ManutentionResult {
    duree: number;
    duree37: number;
    montColis: number | null;
    montMagasin: number | null;
    montMagasin37: number | null;
    montArrimage: number | null;
    surtaxeColisLourd: number;
    peage: number;
    montEtiquette: number;
    manutBateau: number;
    manutCamion: number;
    montSalissage: number;
    montPalette: number;
    montPesageMagasin: number;
    montFaireSuivre: number;
    montantTotalManutention: number;
    montPesMag: number;
    montantPaye: number;
    montantReduction: number;
    montantTVA: number;
    montantGardiennage: number;
    montantMagasinage: number;
    facture:string;
    lt:string;
    redv:number
    tauxReduction:number
    declarant:string;
    nomClient:String
    nomMarchandise:String;
    clientId:number;
    marchandiseId:number;
    dossierId:string;
    montantFixationPlaque:number;
    tonnageArrondi:number;
    tonnage:number;
 
    

    constructor() {
        this.duree = 0;
        this.duree37 = 0;
        this.montColis = null;
        this.montMagasin = null;
        this.montMagasin37 = null;
        this.montArrimage = null;
        this.surtaxeColisLourd = 0;
        this.peage = 0;
        this.montEtiquette = 0;
        this.manutBateau = 0;
        this.manutCamion = 0;
        this.montSalissage = 0;
        this.montPalette = 0;
        this.montPesageMagasin = 0;
        this.montFaireSuivre = 0;
        this.montantTotalManutention = 0;
        this.montPesMag = 0;
        this.montantPaye = 0;
        this.montantReduction = 0;
        this.montantTVA = 0;
        this.montantGardiennage = 0;
        this.montantMagasinage = 0;
        this.facture='';
        this.lt='';
        this.redv=0;
        this.tauxReduction=0;
        this.declarant='';
        this.nomClient='';
        this.nomMarchandise='';
        this.clientId=0;
        this.marchandiseId=0;
        this.dossierId ='';
        this.montantFixationPlaque=0;
        this.tonnageArrondi=0;
         this.tonnage=0
      
          
    }
}