export class Sortie {
    sortieId?: number;
    exercice: number;
    matriculeId: string;
    nom: string;
    prenom: string;
    dateSortie: string;
    nbrJours: number;
    nbrHeures: number;
    nbrMinute: number;
    justification: string;

    constructor() {
        this.exercice = new Date().getFullYear();
        this.matriculeId = '';
        this.nom = '';
        this.prenom = '';
        this.dateSortie = '';
        this.nbrJours = 0;
        this.nbrHeures = 0;
        this.nbrMinute = 0;
        this.justification = '';
    }
}