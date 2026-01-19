export class CptExercice {
  exerciceId: string;
  codeExercice: string;
  dossierId: string;
  description: string;
  dateDebut: string;       // format ISO string (ex: '2025-01-01')
  dateFin: string;
  dateCloture: string;

  constructor() {
    this.exerciceId = '';
    this.codeExercice = '';
    this.dossierId = '';
    this.description = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.dateCloture = '';
  }
}