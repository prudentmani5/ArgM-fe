export class Cotation {
    cotationId?: string;
    exercice: number;
    matriculeId: string;
    cote: string;
    nbrPoints1: number;
    nbrPoints2: number;
    commentaire: string;
    baseAncienne: number;
    noteObtenue: number;

    // Additional fields for display purposes
    employeeName?: string;
    employeeFirstName?: string;
    statut?: string;

    constructor() {
        this.exercice = new Date().getFullYear(); // Current year
        this.matriculeId = '';
        this.cote = '';
        this.nbrPoints1 = 0;
        this.nbrPoints2 = 0;
        this.commentaire = '';
        this.baseAncienne = 0;
        this.noteObtenue = 0;
        this.employeeName = '';
        this.employeeFirstName = '';
        this.statut = '';
    }
}