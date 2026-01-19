// Devise.ts
export class Devise {
    deviseId: string;
    LibelleDevise: string;
    Symbole: string;
    TauxChange: number | null;

    constructor() {
        this.deviseId = '';
        this.LibelleDevise = '';
        this.Symbole = '';
        this.TauxChange = null;
    }
}