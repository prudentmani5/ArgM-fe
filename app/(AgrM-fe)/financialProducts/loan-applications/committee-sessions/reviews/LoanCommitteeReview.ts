export interface LoanCommitteeReview {
    id: number;
    applicationId: number;
    application?: string;
    sessionId: number;
    session?: string;
    reviewedById: number;
    reviewedBy?: string;
    decisionTypeId: number;
    decisionType?: string;
    approvedAmount: number | null;
    approvedTermMonths: number | null;
    approvedInterestRate: number | null;
    decisionRationale: string;
    conditions: string;
    votesFor: number;
    votesAgainst: number;
    votesAbstained: number;
    reviewDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface DecisionType {
    id: number;
    code: string;
    name: string;
}
