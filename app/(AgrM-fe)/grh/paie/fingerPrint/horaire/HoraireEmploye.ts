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
    dateDebutD: Date | null;
    dateFinD: Date | null;

    constructor() {
        this.dateDebutD = null;
        this.dateFinD = null;
    }
}

export interface EmployeeWithHoraire {
    horaire: HoraireEmploye;
    nom: string;
    prenom: string;
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