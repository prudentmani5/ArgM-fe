export class PrimeParametre {
    codePrime: string;
    libellePrime: string;
    imposable: boolean;
    taux: number;
    compteCompta: string;
    reportFromPeriodToAnother: boolean;

    constructor() {
        this.codePrime = '';
        this.libellePrime = '';
        this.imposable = false;
        this.taux = 0;
        this.compteCompta = '';
        this.reportFromPeriodToAnother = false;
    }
}