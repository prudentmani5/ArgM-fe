// Banque.ts
export class Banque {
    codeBanque: string;
    sigle: string;
    libelleBanque: string;
    compte: string | null;

    constructor() {
        this.codeBanque = '';
        this.sigle = '';
        this.libelleBanque = '';
        this.compte = null;
    }
}