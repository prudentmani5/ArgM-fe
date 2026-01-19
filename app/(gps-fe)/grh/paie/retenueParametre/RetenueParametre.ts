export class RetenueParametre {
    codeRet: string;
    libelleRet: string;
    imposable: boolean;
    estCredit: boolean;
    compteCompta: string;
    actif: boolean;
    displayInPaymentToDO: boolean;

    constructor() {
        this.codeRet = '';
        this.libelleRet = '';
        this.imposable = false;
        this.estCredit = false;
        this.compteCompta = '';
        this.actif = true;
        this.displayInPaymentToDO = false;
    }
}