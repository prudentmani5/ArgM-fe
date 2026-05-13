export class HoraireEmploye {
    horaireId?: number;
    matriculeId: string;
    groupeId: string;
    serviceId: string;
    dateDebut: string;
    dateFin: string;
    numeroOrdre: number;
    nom?: string;
    prenom?: string;

    constructor() {
        this.horaireId = undefined;
        this.matriculeId = '';
        this.groupeId = '';
        this.serviceId = '';
        this.dateDebut = '';
        this.dateFin = '';
        this.numeroOrdre = 0;
        this.nom = '';
        this.prenom = '';
    }
}

export class HoraireDateRange {
    dateDebutD: string;
    dateFinD: string;

    constructor() {
        this.dateDebutD = '';
        this.dateFinD = '';
    }
}

export interface EmployeeWithHoraire {
    horaire: HoraireEmploye | null;
    nom: string;
    prenom: string;
    serviceId?: string;
}

export class ShiftGroupe {
    groupeId: string;
    libelle: string;
    heureDebut: string;
    heureFin: string;

    constructor() {
        this.groupeId = '';
        this.libelle = '';
        this.heureDebut = '';
        this.heureFin = '';
    }
}

export interface GroupMapping {
    sourceGroupId: string;
    targetGroupId: string;
}

export interface ChangeGroupsRequest {
    dateDebut: string;
    dateFin: string;
    mode: 'automatic' | 'manual';
    mappings?: GroupMapping[];
}