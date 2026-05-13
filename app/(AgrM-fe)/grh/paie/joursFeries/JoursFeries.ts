export class JoursFeries {
    jourFerieId: number | null;
    dateFerie: string;
    libelle: string;
    description: string;

    constructor() {
        this.jourFerieId = null;
        this.dateFerie = '';
        this.libelle = '';
        this.description = '';
    }
}
