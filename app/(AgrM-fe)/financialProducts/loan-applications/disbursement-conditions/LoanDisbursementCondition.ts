export interface LoanDisbursementCondition {
    id: number;
    applicationId: number;
    conditionTypeId: number;
    conditionType?: string;
    description: string;
    isMandatory: boolean;
    deadlineDate: Date | string | null;
    status: ConditionStatus;
    fulfillmentNotes: string;
    verifiedById: number | null;
    verifiedBy?: string;
    fulfilledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export enum ConditionStatus {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    VERIFIED = 'VERIFIED',
    WAIVED = 'WAIVED',
    EXPIRED = 'EXPIRED'
}

export const ConditionStatusLabels = {
    [ConditionStatus.PENDING]: 'Pending',
    [ConditionStatus.SUBMITTED]: 'Submitted',
    [ConditionStatus.VERIFIED]: 'Verified',
    [ConditionStatus.WAIVED]: 'Waived',
    [ConditionStatus.EXPIRED]: 'Expired'
};

export const ConditionStatusColors = {
    [ConditionStatus.PENDING]: 'warning',
    [ConditionStatus.SUBMITTED]: 'info',
    [ConditionStatus.VERIFIED]: 'success',
    [ConditionStatus.WAIVED]: 'secondary',
    [ConditionStatus.EXPIRED]: 'danger'
};

export interface ConditionType {
    id: number;
    code: string;
    name: string;
    description: string;
}
