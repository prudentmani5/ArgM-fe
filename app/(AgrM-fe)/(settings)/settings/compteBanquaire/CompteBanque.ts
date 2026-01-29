// models/CompteBanque.ts
export class CompteBanque {
    compteBanqueId: number | null;
    numeroCompte: string;
    banqueId: number;
    deviseId: number;
    banque?: Bank; // Optionnel pour l'affichage
    devise?: Devise; // Optionnel pour l'affichage

    constructor() {
        this.compteBanqueId = null;
        this.numeroCompte = '';
        this.banqueId = 0;
        this.deviseId = 0;
    }
}

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

// models/Devise.ts (supposé similaire à Bank)
export class Devise {
    deviseId: number;
    code: string;
    libelle: string;

    constructor() {
        this.deviseId = 0;
        this.code = '';
        this.libelle = '';
    }
}