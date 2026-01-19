export class GrhPoste {
    posteId: string;
    fonctionId: string;
    fonctionLibelle: string; // For display purposes
    nbrePoste: number;
    nbrePosteVacant: number;

    constructor() {
        this.posteId = '';
        this.fonctionId = '';
        this.fonctionLibelle = '';
        this.nbrePoste = 0;
        this.nbrePosteVacant = 0;
    }
}