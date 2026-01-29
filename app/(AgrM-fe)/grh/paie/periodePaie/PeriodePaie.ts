export class PeriodePaie {
    periodeId: string;
    mois: number;
    annee: number;
    dateDebut: string;
    dateFin: string;
    dateOuverture: string;
    dateCloture: string;
    userIdOuverture: string;
    userIdCloture: string;

    constructor() {
        this.periodeId = '';
        this.mois = 0;
        this.annee = new Date().getFullYear();
        this.dateDebut = '';
        this.dateFin = '';
        this.dateOuverture = '';
        this.dateCloture = '';
        this.userIdOuverture = '';
        this.userIdCloture = '';
    }
}