export class TermDepositDuration {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    durationMonths: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.durationMonths = 12;
        this.isActive = true;
    }
}
