export class LoanRiskScoreDetail {
    id?: number;
    riskAssessmentId: number;
    riskAssessment?: any;
    scoreFactorId: number;
    scoreFactor?: any;
    scoreValue: number;
    weight: number;
    weightedScore: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.riskAssessmentId = 0;
        this.scoreFactorId = 0;
        this.scoreValue = 0;
        this.weight = 0;
        this.weightedScore = 0;
    }
}
