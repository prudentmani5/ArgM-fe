export class ActionDisciplinaire {
    actionId: number;
    matriculeId: string;
    nom: string;
    prenom: string;
    dateOuverture: string;
    dateReponse: string;
    dateCloture: string;
    dateDecision: string;
    decisionPrise: string;
    refDecision: string;
    autoriteDecision: string;
    dateLevee: string;
    refLevee: string;
    observation: string;
    motivation: string;
    defense: string;

    constructor() {
        this.actionId = 0;
        this.matriculeId = '';
        this.nom = '';
        this.prenom = '';
        this.dateOuverture = '';
        this.dateReponse = '';
        this.dateCloture = '';
        this.dateDecision = '';
        this.decisionPrise = '';
        this.refDecision = '';
        this.autoriteDecision = '';
        this.dateLevee = '';
        this.refLevee = '';
        this.observation = '';
        this.motivation = '';
        this.defense = '';
    }
}
