export class Grade {
    gradeId: string;
    libelle: string;
    categorieId: string;
    valeurIndice: number;

    constructor() {
        this.gradeId = '';
        this.libelle = '';
        this.categorieId = '';
        this.valeurIndice = 0;
    }
}