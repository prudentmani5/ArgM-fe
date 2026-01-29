export class ApprovalLevel {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    levelNumber: number;
    minAmount?: number;
    maxAmount?: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.levelNumber = 1;
        this.isActive = true;
    }
}
