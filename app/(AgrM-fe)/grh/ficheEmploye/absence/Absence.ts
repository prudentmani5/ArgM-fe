export class Absence {
    absenceId: number;
    exercice: number;
    matriculeId: string;
    dateDebut: string;
    dateFin: string;
    nbrJours: number;
    nbrHeures: number;
    estJustifie: boolean;
    reference: string;
    justification: string;
    nbrMinute: number;

    constructor() {
        this.absenceId = 0;
        this.exercice = new Date().getFullYear();
        this.matriculeId = '';
        this.dateDebut = '';
        this.dateFin = '';
        this.nbrJours = 0;
        this.nbrHeures = 0;
        this.estJustifie = false;
        this.reference = '';
        this.justification = '';
        this.nbrMinute = 0;
    }
}