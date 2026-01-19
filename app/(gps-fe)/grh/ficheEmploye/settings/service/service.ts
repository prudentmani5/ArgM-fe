export class Service {
  ServiceId: string;
  DepartementId: string;
  Libelle: string;
  Responsable?: string;

  constructor(
    serviceId: string = '',
    departementId: string = '',
    libelle: string = '',
    responsable?: string
  ) {
    this.ServiceId = serviceId;
    this.DepartementId = departementId;
    this.Libelle = libelle;
    this.Responsable = responsable;
  }

  static createEmpty(): Service {
    return new Service();
  }

  isValid(): boolean {
    return this.ServiceId.length > 0 && 
           this.DepartementId.length > 0 && 
           this.Libelle.length > 0;
  }

  getFullInfo(): string {
    return `${this.ServiceId} - ${this.Libelle}`;
  }
}