export class LoanPurpose {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    activitySectorId?: number;
    activitySector?: any;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.isActive = true;
    }
}
