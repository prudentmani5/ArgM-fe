export class CptBrouillard {
  brouillardId: string;
  codeBrouillard: string;
  exerciceId: string;
  dossierId: string;
  journalId: string;
  codeJournal:string;
  description: string;
  dateDebut: string;        // ISO format 'YYYY-MM-DD'
  dateFin: string;
  valide: boolean;
  userCreation: string;
  dateCreation: string;     // ISO format 'YYYY-MM-DDTHH:mm:ss'
  userUpdate: string;
  dateUpdate: string;
  userValidation: string;
  dateValidation: string;
  codeLibelle:string;

  constructor() {
    this.brouillardId = '';
    this.codeBrouillard = '';
    this.exerciceId = '';
    this.dossierId = '';
    this.journalId = '';
    this.codeJournal='';
    this.description = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.valide = false;
    this.userCreation = '';
    this.dateCreation = '';
    this.userUpdate = '';
    this.dateUpdate = '';
    this.userValidation = '';
    this.dateValidation = '';
    this.codeLibelle='';
  }
}
