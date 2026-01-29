export class CreditScoreFactor {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    maxScore: number;
    weight: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.maxScore = 100;
        this.weight = 1.0;
        this.isActive = true;
    }
}
