export interface IStkExercice {
    exerciceId: string;
    libelle: string;
    annee?: string;
    magasinId?: string;
    dateDebut: string;
    dateFin: string;
    dateOuverture: string;
    userOuverture: string;
    dateCloture?: string;
    userCloture?: string;
}

export class StkExercice implements IStkExercice {
    constructor(
        public exerciceId: string = '',
        public libelle: string = '',
        public annee: string = '',
        public magasinId: string = '',
        public dateDebut: string = '',
        public dateFin: string = '',
        public dateOuverture: string = '',
        public userOuverture: string = '',
        public dateCloture: string = '',
        public userCloture: string = ''
    ) {}
}

export const defaultStkExercice: IStkExercice = {
    exerciceId: '',
    libelle: '',
    dateDebut: '',
    dateFin: '',
    dateOuverture: '',
    userOuverture: ''
};