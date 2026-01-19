// models/Bank.ts
export class Bank {
    banqueId: number;
    sigle: string;
    libelleBanque: string;
    compte: string;

    constructor() {
        this.banqueId = 0;
        this.sigle = '';
        this.libelleBanque = '';
        this.compte = '';
    }
}