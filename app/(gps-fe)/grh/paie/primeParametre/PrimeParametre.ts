export class PrimeParametre {
    codePrime: string;
    libellePrime: string;
    imposable: boolean;
    taux: number;
    compteCompta: string;

    constructor() {
        this.codePrime = '';
        this.libellePrime = '';
        this.imposable = false;
        this.taux = 0;
        this.compteCompta = '';
    }
}