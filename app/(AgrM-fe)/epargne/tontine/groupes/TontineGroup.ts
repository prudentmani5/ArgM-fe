// Groupe de tontine
export interface TontineGroup {
    id?: number;
    groupCode: string;
    groupName: string;
    branchId?: number;
    branch?: any;
    statusId?: number;
    status?: any;
    description?: string;
    // Paramètres du groupe
    contributionAmount: number;
    currencyId?: number;
    currency?: any;
    contributionFrequency: ContributionFrequency;
    maxMembers: number;
    currentMemberCount: number;
    // Dates
    formationDate: string;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    // Cycle
    currentCycleNumber: number;
    totalCycles: number;
    // Contact
    coordinatorId?: number;
    coordinator?: any;
    meetingDay?: string;
    meetingTime?: string;
    meetingLocation?: string;
    // Règles
    latePaymentPenaltyRate: number;
    missedPaymentPenaltyRate: number;
    rules?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    // Relations
    members?: TontineMember[];
    cycles?: TontineCycle[];
}

export enum ContributionFrequency {
    WEEKLY = 'WEEKLY',
    BI_WEEKLY = 'BI_WEEKLY',
    MONTHLY = 'MONTHLY'
}

export class TontineGroupClass implements TontineGroup {
    id?: number;
    groupCode: string = '';
    groupName: string = '';
    branchId?: number;
    branch?: any;
    statusId?: number;
    status?: any;
    description?: string = '';
    contributionAmount: number = 10000;
    currencyId?: number;
    currency?: any;
    contributionFrequency: ContributionFrequency = ContributionFrequency.MONTHLY;
    maxMembers: number = 12;
    currentMemberCount: number = 0;
    formationDate: string = new Date().toISOString().split('T')[0];
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    currentCycleNumber: number = 0;
    totalCycles: number = 0;
    coordinatorId?: number;
    coordinator?: any;
    meetingDay?: string;
    meetingTime?: string;
    meetingLocation?: string;
    latePaymentPenaltyRate: number = 5.0;
    missedPaymentPenaltyRate: number = 10.0;
    rules?: string = '';
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;
    members?: TontineMember[] = [];
    cycles?: TontineCycle[] = [];

    constructor(init?: Partial<TontineGroup>) {
        Object.assign(this, init);
    }
}

// Membre de tontine
export interface TontineMember {
    id?: number;
    tontineGroupId: number;
    tontineGroup?: TontineGroup;
    clientId?: number;
    client?: any;
    memberNumber: number;
    statusId?: number;
    status?: any;
    joinDate: string;
    exitDate?: string;
    exitReason?: string;
    payoutOrder: number;
    hasReceivedPayout: boolean;
    payoutReceivedDate?: string;
    totalContributed: number;
    missedContributions: number;
    lateContributions: number;
    penaltiesPaid: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class TontineMemberClass implements TontineMember {
    id?: number;
    tontineGroupId: number = 0;
    tontineGroup?: TontineGroup;
    clientId?: number;
    client?: any;
    memberNumber: number = 0;
    statusId?: number;
    status?: any;
    joinDate: string = new Date().toISOString().split('T')[0];
    exitDate?: string;
    exitReason?: string;
    payoutOrder: number = 0;
    hasReceivedPayout: boolean = false;
    payoutReceivedDate?: string;
    totalContributed: number = 0;
    missedContributions: number = 0;
    lateContributions: number = 0;
    penaltiesPaid: number = 0;
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TontineMember>) {
        Object.assign(this, init);
    }
}

// Cycle de tontine
export interface TontineCycle {
    id?: number;
    tontineGroupId: number;
    tontineGroup?: TontineGroup;
    cycleNumber: number;
    statusId?: number;
    status?: any;
    startDate: string;
    endDate?: string;
    dueDate: string;
    beneficiaryMemberId?: number;
    beneficiaryMember?: TontineMember;
    expectedAmount: number;
    collectedAmount: number;
    payoutAmount: number;
    payoutDate?: string;
    payoutProcessedByUserId?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    contributions?: TontineContribution[];
}

export class TontineCycleClass implements TontineCycle {
    id?: number;
    tontineGroupId: number = 0;
    tontineGroup?: TontineGroup;
    cycleNumber: number = 1;
    statusId?: number;
    status?: any;
    startDate: string = new Date().toISOString().split('T')[0];
    endDate?: string;
    dueDate: string = '';
    beneficiaryMemberId?: number;
    beneficiaryMember?: TontineMember;
    expectedAmount: number = 0;
    collectedAmount: number = 0;
    payoutAmount: number = 0;
    payoutDate?: string;
    payoutProcessedByUserId?: number;
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;
    contributions?: TontineContribution[] = [];

    constructor(init?: Partial<TontineCycle>) {
        Object.assign(this, init);
    }
}

// Cotisation
export interface TontineContribution {
    id?: number;
    tontineCycleId: number;
    tontineCycle?: TontineCycle;
    memberId: number;
    member?: TontineMember;
    statusId?: number;
    status?: any;
    dueDate: string;
    paidDate?: string;
    expectedAmount: number;
    paidAmount: number;
    penaltyAmount: number;
    totalPaid: number;
    paymentMethod?: string;
    transactionId?: number;
    collectedByUserId?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class TontineContributionClass implements TontineContribution {
    id?: number;
    tontineCycleId: number = 0;
    tontineCycle?: TontineCycle;
    memberId: number = 0;
    member?: TontineMember;
    statusId?: number;
    status?: any;
    dueDate: string = '';
    paidDate?: string;
    expectedAmount: number = 0;
    paidAmount: number = 0;
    penaltyAmount: number = 0;
    totalPaid: number = 0;
    paymentMethod?: string;
    transactionId?: number;
    collectedByUserId?: number;
    notes?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<TontineContribution>) {
        Object.assign(this, init);
    }
}

// Paiement de tontine
export interface TontinePayout {
    id?: number;
    tontineCycleId: number;
    beneficiaryMemberId: number;
    payoutDate: string;
    grossAmount: number;
    deductions: number;
    netAmount: number;
    paymentMethod?: string;
    transactionId?: number;
    processedByUserId?: number;
    notes?: string;
    createdAt?: string;
}
