export class Categorie {
  CategorieId: string;
  Libelle: string;

  constructor(
    categorieId: string = '',
    libelle: string = ''
  ) {
    this.CategorieId = categorieId;
    this.Libelle = libelle;
  }

  static createEmpty(): Categorie {
    return new Categorie();
  }

  isValid(): boolean {
    return this.CategorieId.length > 0 && this.Libelle.length > 0;
  }

  getDisplayName(): string {
    return `${this.CategorieId} - ${this.Libelle}`;
  }

  toJSON(): any {
    return { ...this };
  }

  static fromJSON(json: any): Categorie {
    const categorie = new Categorie();
    Object.assign(categorie, json);
    return categorie;
  }
}