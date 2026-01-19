export class FormationStage {
    formationId: number;
    domaineId: string;
    matriculeId: string;
    institut: string;
    dateDebut: string;
    dateFin: string;
    nbrAnnees: number;
    nbrMois: number;
    nbrJours: number;
    nbrHeures: number;
    diplomeCertificat: string;
    typeDiplomeId: string;
    description: string;

    constructor() {
        this.formationId = 0;
        this.domaineId = '';
        this.matriculeId = '';
        this.institut = '';
        this.dateDebut = '';
        this.dateFin = '';
        this.nbrAnnees = 0;
        this.nbrMois = 0;
        this.nbrJours = 0;
        this.nbrHeures = 0;
        this.diplomeCertificat = 'C';
        this.typeDiplomeId = '';
        this.description = '';
    }
}