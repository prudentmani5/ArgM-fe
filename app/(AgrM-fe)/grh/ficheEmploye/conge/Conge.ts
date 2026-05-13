export class Conge {
    congeId: number;
    matriculeId: string;
    nom: string;
    prenom: string;
    typeCongeId: string;
    exercice: number;
    nbrJoursSollicites: number;
    nbrJoursAccordes: number;
    nbrJoursEffectifs: number;
    dateDebut: string;    // Format: "dd/MM/yyyy"
    dateRetour: string;   // Format: "dd/MM/yyyy"
    nbrJoursDisponible: number;
    cumuleCongeCirconstance: number;
    typeCircostance: string;

    constructor() {
        this.congeId = 0;
        this.matriculeId = '';
        this.nom = '';
        this.prenom = '';
        this.typeCongeId = '';
        this.exercice = new Date().getFullYear();
        this.nbrJoursSollicites = 0;
        this.nbrJoursAccordes = 0;
        this.nbrJoursEffectifs = 0;
        this.dateDebut = '';
        this.dateRetour = '';
        this.nbrJoursDisponible = 0;
        this.cumuleCongeCirconstance = 0;
        this.typeCircostance = '';
    }
}