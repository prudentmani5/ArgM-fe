export class SaisieHeureSupplementaire {
    id: number | null;
    matriculeId: string;
    periodeId: string;
    dateSaisie: string;
    nom: string;
    prenom: string;
    hs135: number;
    hs160: number;
    hs200: number;
    totalHeures: number;

    constructor() {
        this.id = null;
        this.matriculeId = '';
        this.periodeId = '';
        this.dateSaisie = '';
        this.nom = '';
        this.prenom = '';
        this.hs135 = 0;
        this.hs160 = 0;
        this.hs200 = 0;
        this.totalHeures = 0;
    }

    // Calculate total hours
    calculateMontants(): void {
        this.totalHeures = this.hs135 + this.hs160 + this.hs200;
    }

    isValid(): boolean {
        return this.matriculeId.length > 0 && this.periodeId.length > 0 && this.dateSaisie.length > 0;
    }
}
