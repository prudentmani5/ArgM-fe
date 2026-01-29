export class Fonction {
  FonctionId: string;
  Libelle: string;
  Description?: string;

  constructor(
    fonctionId: string = '',
    libelle: string = '',
    description?: string
  ) {
    this.FonctionId = fonctionId;
    this.Libelle = libelle;
    this.Description = description;
  }

  static createEmpty(): Fonction {
    return new Fonction();
  }

  isValid(): boolean {
    return this.FonctionId.length > 0 && this.Libelle.length > 0;
  }

  getDisplayName(): string {
    return `${this.FonctionId} - ${this.Libelle}`;
  }

  toJSON(): any {
    return { ...this };
  }

  static fromJSON(json: any): Fonction {
    const fonction = new Fonction();
    Object.assign(fonction, json);
    return fonction;
  }
}