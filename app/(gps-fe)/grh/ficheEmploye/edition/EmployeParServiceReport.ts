export interface EmployeParService {
    matriculeId: string;
    nom: string;
    prenom: string;
    serviceId: string;
    serviceLibelle: string;
}

export interface ServiceGroup {
    serviceId: string;
    serviceLibelle: string;
    employees: EmployeParService[];
}

export class EmployeParServiceReport {
    serviceGroups: ServiceGroup[];

    constructor() {
        this.serviceGroups = [];
    }
}
