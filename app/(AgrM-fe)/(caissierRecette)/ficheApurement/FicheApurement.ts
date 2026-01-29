export class FicheApurement {
    ficheId: number;
    numLT: string;
    numDMC: string;
    marchandiseId: number;
    emballageId: number;
    nbreColisTotal: number;
    poidsTotal: number;
    clientId: number;
    nomClient: string;
    importateurNom: string;
    dateCreation: Date | null;
    natureCoils:string;
    nomMarchandise:string

    constructor() {
        this.ficheId = 0;
        this.numLT = '';
        this.numDMC = '';
        this.marchandiseId = 0;
        this.emballageId = 0;
        this.nbreColisTotal = 0;
        this.poidsTotal = 0;
        this.clientId = 0;
        this.nomClient = '';
        this.importateurNom = '';
        this.dateCreation = null;
        this.natureCoils='';
        this.nomMarchandise=''
    }
}

export class FicheApurementDetail {
    ficheDetailId: number;
    ficheId: number;
    dateCaisse: Date | null;
    plaque: string;
    nbreColisSortis: number;
    poidsSortis: number;
    colisRestants: number;
    poidsRestants: number;
    colisError: any;

    constructor() {
        this.ficheDetailId = 0;
        this.ficheId = 0;
        this.dateCaisse = null;
        this.plaque = '';
        this.nbreColisSortis = 0;
        this.poidsSortis = 0;
        this.colisRestants = 0;
        this.poidsRestants = 0;
    }
}

export class EnterRSP {
    entreeImportId: string;
    noLettreTransport: string;
    noEntree: string;
    recuPalan: string;
    marchandiseId : number;
    emballageId: number;
    importateurId: number;
    nomclient: string;
    nbreColis: number;
    poids: number;
    natureCoils:string;
    nomMarchandise:string;
    dateEntree: Date | null;
    ficheId: number;

    constructor() {
        this.entreeImportId = '';
        this.noLettreTransport = '';
        this.importateurId = 0;
        this.nomclient = '';
        this.nbreColis = 0;
        this.poids = 0;
        this.dateEntree = null;
        this.noEntree = '';
        this.recuPalan= '';
        this.marchandiseId = 0;
        this.emballageId= 0;
        this.natureCoils= '';
        this.nomMarchandise= '';
        this.ficheId=0;
    }
}