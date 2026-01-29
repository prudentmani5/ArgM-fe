export class RiskLevel {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    riskScore: number;
    color?: string;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.riskScore = 0;
        this.isActive = true;
    }
}
