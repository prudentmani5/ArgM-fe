// StkExercice.ts
export class StkExercice {
    exerciceId: string;
    libelle: string;
    annee: string | null;
    magasinId: string | null;
    dateDebut: string;
    dateFin: string;
    dateOuverture: string;
    userOuverture: string;
    dateCloture: string | null;
    userCloture: string | null;

    constructor() {
        this.exerciceId = '';
        this.libelle = '';
        this.annee = null;
        this.magasinId = null;
        this.dateDebut = '';
        this.dateFin = '';
        this.dateOuverture = '';
        this.userOuverture = '';
        this.dateCloture = null;
        this.userCloture = null;
    }
}