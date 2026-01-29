export interface LoanCommitteeSession {
    id: number;
    sessionDate: Date | string;
    sessionTime: string;
    branchId: number;
    branch?: string;
    venue: string;
    status: SessionStatus;
    scheduledStartTime: string;
    scheduledEndTime: string;
    startedAt?: Date | string | null;
    endedAt?: Date | string | null;
    chairpersonId: number;
    chairperson?: string;
    secretaryId: number;
    secretary?: string;
    agenda: string;
    minutes: string;
    createdById?: number;
    createdBy?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export const SessionStatusLabels = {
    [SessionStatus.SCHEDULED]: 'Scheduled',
    [SessionStatus.IN_PROGRESS]: 'In Progress',
    [SessionStatus.COMPLETED]: 'Completed',
    [SessionStatus.CANCELLED]: 'Cancelled'
};

export const SessionStatusColors = {
    [SessionStatus.SCHEDULED]: 'info',
    [SessionStatus.IN_PROGRESS]: 'warning',
    [SessionStatus.COMPLETED]: 'success',
    [SessionStatus.CANCELLED]: 'danger'
};
