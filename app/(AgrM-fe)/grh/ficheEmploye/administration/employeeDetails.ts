export class EmployeeDetail {
  matriculeId: string;
  etatCivil: string;
  conjointSalarie: boolean;
  nbreEnfant: number;
  telBureau?: string;
  telHabitat?: string;
  telMobile1?: string;
  telMobile2?: string;
  email?: string;
  adresse?: string;
  refExtraitCasierJudiciaire?: string;
  refLettreEngagement?: string;
  refAffectation?: string;
  refAvancementGrade?: string;
  nbJoursConge?: number;
  nbJoursCongeAnneePrec?: number;

  constructor(
    matriculeId: string = '',
    etatCivil: string = '',
    conjointSalarie: boolean = false,
    nbreEnfant: number = 0,
    telBureau?: string,
    telHabitat?: string,
    telMobile1?: string,
    telMobile2?: string,
    email?: string,
    adresse?: string,
    refExtraitCasierJudiciaire?: string,
    refLettreEngagement?: string,
    refAffectation?: string,
    refAvancementGrade?: string,
    nbJoursConge: number = 20,
    nbJoursCongeAnneePrec: number = 0
  ) {
    this.matriculeId = matriculeId;
    this.etatCivil = etatCivil;
    this.conjointSalarie = conjointSalarie;
    this.nbreEnfant = nbreEnfant;
    this.telBureau = telBureau;
    this.telHabitat = telHabitat;
    this.telMobile1 = telMobile1;
    this.telMobile2 = telMobile2;
    this.email = email;
    this.adresse = adresse;
    this.refExtraitCasierJudiciaire = refExtraitCasierJudiciaire;
    this.refLettreEngagement = refLettreEngagement;
    this.refAffectation = refAffectation;
    this.refAvancementGrade = refAvancementGrade;
    this.nbJoursConge = nbJoursConge;
    this.nbJoursCongeAnneePrec = nbJoursCongeAnneePrec;
  }

  // Helper method to get all phone numbers
  getPhoneNumbers(): string[] {
    const phones = [this.telBureau, this.telHabitat, this.telMobile1, this.telMobile2];
    return phones.filter(phone => phone && phone.length > 0) as string[];
  }

  // Helper method to get total vacation days
  getTotalVacationDays(): number {
    const current = this.nbJoursConge || 0;
    const previous = this.nbJoursCongeAnneePrec || 0;
    return current + previous;
  }
}