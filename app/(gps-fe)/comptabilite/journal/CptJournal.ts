export class CptJournal {
  journalId: string;
  codeJournal: string;
  dossierId: string;
  typeJournal: string;
  nomJournal: string;
  compteId: string;
  enDevise: boolean;
codeLibelle:string;

  constructor() {
    this.journalId = '';
    this.codeJournal = '';
    this.dossierId = '';
    this.typeJournal = '';
    this.nomJournal = '';
    this.compteId = '';
    this.enDevise = false;
    this.codeLibelle='';
  }
}
