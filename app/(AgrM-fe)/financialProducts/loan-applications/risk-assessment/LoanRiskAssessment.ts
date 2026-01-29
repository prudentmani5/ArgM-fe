export class LoanRiskAssessment {
    id?: number;
    applicationId: number;
    application?: any;
    characterScore: number;
    capacityScore: number;
    capitalScore: number;
    collateralScore: number;
    conditionsScore: number;
    totalRiskScore: number;
    riskLevelId?: number;
    riskLevel?: any;
    assessmentNotes?: string;
    assessedById?: number;
    assessedBy?: any;
    assessedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationId = 0;
        this.characterScore = 0;
        this.capacityScore = 0;
        this.capitalScore = 0;
        this.collateralScore = 0;
        this.conditionsScore = 0;
        this.totalRiskScore = 0;
    }
}
