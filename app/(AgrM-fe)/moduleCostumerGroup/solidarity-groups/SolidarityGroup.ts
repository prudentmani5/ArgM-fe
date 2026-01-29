// Enums
export enum MeetingFrequency {
    WEEKLY = 'WEEKLY',
    BIWEEKLY = 'BIWEEKLY',
    MONTHLY = 'MONTHLY',
    CUSTOM = 'CUSTOM'
}

export enum GroupStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DISSOLVED = 'DISSOLVED'
}

export enum CohesionRating {
    EXCELLENT = 'EXCELLENT',
    GOOD = 'GOOD',
    FAIR = 'FAIR',
    POOR = 'POOR'
}

export enum MemberStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    WITHDRAWN = 'WITHDRAWN',
    EXCLUDED = 'EXCLUDED'
}

export enum ExitType {
    VOLUNTARY_WITHDRAWAL = 'VOLUNTARY_WITHDRAWAL',
    EXCLUSION = 'EXCLUSION',
    TRANSFER = 'TRANSFER',
    GROUP_DISSOLUTION = 'GROUP_DISSOLUTION'
}

// Reference Types
export interface GroupType {
    id?: number;
    code: string;
    name: string;
    description?: string;
    minMembers?: number;
    maxMembers?: number;
    isActive: boolean;
}

export interface GroupRole {
    id?: number;
    code: string;
    name: string;
    description?: string;
    isExecutive: boolean;
    isActive: boolean;
}

export interface GuaranteeType {
    id?: number;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Province {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface Commune {
    id?: number;
    code: string;
    name: string;
    provinceId?: number;
    isActive: boolean;
}

export interface Zone {
    id?: number;
    code: string;
    name: string;
    communeId?: number;
    isActive: boolean;
}

export interface ActivitySector {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface Branch {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

// Client Interface (for member selection)
export interface ClientInfo {
    id?: number;
    clientNumber: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    primaryPhone: string;
}

// SolidarityGroup Class
export class SolidarityGroup {
    id?: number;
    groupCode: string;
    groupName: string;
    formationDate: string;

    // Group Type
    groupTypeId?: number;

    // Location
    provinceId?: number;
    communeId?: number;
    zoneId?: number;
    meetingLocation: string;

    // Activity
    primarySectorId?: number;
    groupDescription: string;

    // Size
    minMembers: number;
    maxMembers: number;
    currentMemberCount: number;

    // Meeting Schedule
    meetingFrequency: MeetingFrequency;
    meetingDay: string;
    meetingTime: string;
    customMeetingSchedule: string;

    // Financial
    membershipFee: number;
    savingsTarget: number;
    collectiveSavingsBalance: number;

    // Guarantee
    guaranteeTypeId?: number;
    guaranteeAmount: number;
    guaranteeDescription: string;

    // Performance
    cohesionRating: CohesionRating;
    averageAttendanceRate: number;
    repaymentRate: number;
    lastPerformanceReview: string;

    // Assignment
    assignedOfficerId?: number;
    branchId?: number;

    // Status
    status: GroupStatus;
    statusReason: string;

    // Dissolution
    dissolutionDate: string;
    dissolutionReason: string;

    // Documents
    bylawsDocumentPath: string;

    // Notes
    notes: string;

    // User Action
    userAction?: string;

    constructor() {
        this.groupCode = '';
        this.groupName = '';
        this.formationDate = new Date().toISOString().split('T')[0];
        this.meetingLocation = '';
        this.groupDescription = '';
        this.minMembers = 5;
        this.maxMembers = 30;
        this.currentMemberCount = 0;
        this.meetingFrequency = MeetingFrequency.WEEKLY;
        this.meetingDay = 'MONDAY';
        this.meetingTime = '09:00';
        this.customMeetingSchedule = '';
        this.membershipFee = 0;
        this.savingsTarget = 0;
        this.collectiveSavingsBalance = 0;
        this.guaranteeAmount = 0;
        this.guaranteeDescription = '';
        this.cohesionRating = CohesionRating.GOOD;
        this.averageAttendanceRate = 0;
        this.repaymentRate = 0;
        this.lastPerformanceReview = '';
        this.status = GroupStatus.PENDING_APPROVAL;
        this.statusReason = '';
        this.dissolutionDate = '';
        this.dissolutionReason = '';
        this.bylawsDocumentPath = '';
        this.notes = '';
    }
}

// GroupMember Class
export class GroupMember {
    id?: number;
    groupId?: number;
    clientId?: number;
    roleId?: number;
    isExecutive: boolean;
    joinDate: string;
    membershipNumber: string;
    shareContribution: number;
    totalContributions: number;
    status: MemberStatus;
    statusReason: string;
    statusChangedAt?: string;
    exitDate: string;
    exitType?: ExitType;
    exitReason: string;
    notes: string;
    approvedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    // Client info (from backend relationship)
    client?: {
        id?: number;
        clientNumber?: string;
        firstName?: string;
        lastName?: string;
        businessName?: string;
        phonePrimary?: string;
        email?: string;
        photoPath?: string;
    };

    // Role info (from backend relationship)
    role?: {
        id?: number;
        code?: string;
        name?: string;
        nameFr?: string;
        isExecutive?: boolean;
    };

    // For display (computed fields)
    clientNumber?: string;
    clientName?: string;
    clientPhone?: string;
    roleName?: string;

    // User Action
    userAction?: string;

    constructor() {
        this.isExecutive = false;
        this.joinDate = new Date().toISOString().split('T')[0];
        this.membershipNumber = '';
        this.shareContribution = 0;
        this.totalContributions = 0;
        this.status = MemberStatus.PENDING;
        this.statusReason = '';
        this.exitDate = '';
        this.exitReason = '';
        this.notes = '';
    }
}
