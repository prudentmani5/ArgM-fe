// models/DeviseCaisse.ts
export class DeviseCaisse {
    deviseId: number | null;
    codeDevise: string;
    libelle: string;

    constructor() {
        this.deviseId = null;
        this.codeDevise = '';
        this.libelle = '';
    }
}