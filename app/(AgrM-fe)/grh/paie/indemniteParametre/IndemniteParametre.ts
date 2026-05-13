export class IndemniteParametre {
    codeInd: string;
    libelleInd: string;
    imposable: boolean;
    taux: number;
    compteCompta: string;
    reportFromPeriodToAnother: boolean;

    constructor() {
        this.codeInd = '';
        this.libelleInd = '';
        this.imposable = false;
        this.taux = 0;
        this.compteCompta = '';
        this.reportFromPeriodToAnother = false;
    }
}