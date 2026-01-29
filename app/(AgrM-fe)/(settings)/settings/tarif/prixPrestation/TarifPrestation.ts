export class TarifPrestation {
    tarifId: number | null;
    libellePrestation: string;
    tarifSemaine: number;
    tarifFerie: number;

    constructor() {
        this.tarifId = null;
        this.libellePrestation = '';
        this.tarifSemaine = 0;
        this.tarifFerie = 0;
    }
}