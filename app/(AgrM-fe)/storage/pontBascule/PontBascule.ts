export class PontBascule {
    numPBId: number | null;
    type: string;
    factureId: string;
    plaque: string;
    poidsVide: number | null;
    datePont1: Date | null;
    poidsCharge: number | null;
    datePont2: Date | null;
    poidsNet: number | null;
    rsp: string;
    poidsRSP: number | null;
    numDecl: string;
    nbrePalette: number | null;
    numBorderau: string;
    montantPalette: number | null;
    dateEntree: Date | null;
    lt: string;
    clientId: number | null;
    observation: string;
    gardienage: string;
    sigle: string;
    dateCreation: Date | null;
    userCreation: string;
    dateUpdate: Date | null;
    userUpdate: string;

    constructor() {
        this.numPBId = null;
        this.type = '';
        this.factureId = '';
        this.plaque = '';
        this.poidsVide = 0;
        this.datePont1 = new Date();
        this.poidsCharge = 0;
        this.datePont2 = new Date();
        this.poidsNet = 0;
        this.rsp = '';
        this.poidsRSP = 0;
        this.numDecl = '';
        this.nbrePalette = 0;
        this.numBorderau = '';
        this.montantPalette = 0;
        this.dateEntree = null;
        this.lt = '';
        this.clientId = null;
        this.observation = '';
        this.gardienage = '';
        this.sigle = '';
        this.dateCreation = null;
        this.userCreation = '';
        this.dateUpdate = null;
        this.userUpdate = '';
    }

    // Calculate net weight automatically
    calculatePoidsNet(): void {
        if (this.poidsVide && this.poidsCharge) {
            this.poidsNet = Math.abs(this.poidsVide - this.poidsCharge);
        }
    }
}