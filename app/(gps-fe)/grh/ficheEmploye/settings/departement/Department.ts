export class Department {
  departmentId: string;
  libelle: string;

  constructor(
    departmentId: string = '',
    libelle: string = ''
  ) {
    this.departmentId = departmentId;
    this.libelle = libelle;
  }

  // Helper method to create an empty department instance
  static createEmpty(): Department {
    return new Department();
  }

  // Helper method to validate required fields
  isValid(): boolean {
    return this.departmentId.length > 0 && this.libelle.length > 0;
  }

  // Helper method to get display name
  getDisplayName(): string {
    return `${this.departmentId} - ${this.libelle}`;
  }

  // Helper method to convert to JSON-safe object
  toJSON(): any {
    return { ...this };
  }

  // Helper method to create from JSON object
  static fromJSON(json: any): Department {
    const department = new Department();
    Object.assign(department, json);
    return department;
  }

  // Helper method to check if department ID is valid format (3 chars max)
  isValidDepartementId(): boolean {
    return this.departmentId.length <= 3 && this.departmentId.length > 0;
  }

  // Helper method to check if libelle is valid format (50 chars max)
  isValidLibelle(): boolean {
    return this.libelle.length <= 50 && this.libelle.length > 0;
  }

  // Helper method for comprehensive validation
  validateAll(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidDepartementId()) {
      errors.push('L\'ID du département doit contenir entre 1 et 3 caractères.');
    }

    if (!this.isValidLibelle()) {
      errors.push('Le libellé doit contenir entre 1 et 50 caractères.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}