export class Provenance {
    provenanceId: number | null;
    nom: string;
    pays: string;

    constructor() {
        this.provenanceId = null;
        this.nom = '';
        this.pays = '';
    }
}