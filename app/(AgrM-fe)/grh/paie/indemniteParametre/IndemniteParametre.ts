export class IndemniteParametre {
    codeInd: string;
    libelleInd: string;
    imposable: boolean;
    taux: number;
    compteCompta: string;

    constructor() {
        this.codeInd = '';
        this.libelleInd = '';
        this.imposable = false;
        this.taux = 0;
        this.compteCompta = '';
    }
}