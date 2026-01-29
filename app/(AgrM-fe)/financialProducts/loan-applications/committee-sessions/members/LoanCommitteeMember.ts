export interface LoanCommitteeMember {
    id: number;
    sessionId: number;
    userId: number;
    user?: string;
    role: MemberRole;
    notes: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export enum MemberRole {
    CHAIRPERSON = 'CHAIRPERSON',
    SECRETARY = 'SECRETARY',
    MEMBER = 'MEMBER',
    OBSERVER = 'OBSERVER'
}

export const MemberRoleLabels = {
    [MemberRole.CHAIRPERSON]: 'Chairperson',
    [MemberRole.SECRETARY]: 'Secretary',
    [MemberRole.MEMBER]: 'Member',
    [MemberRole.OBSERVER]: 'Observer'
};

export const MemberRoleColors = {
    [MemberRole.CHAIRPERSON]: 'danger',
    [MemberRole.SECRETARY]: 'warning',
    [MemberRole.MEMBER]: 'success',
    [MemberRole.OBSERVER]: 'info'
};

export const MemberRoleIcons = {
    [MemberRole.CHAIRPERSON]: 'pi-crown',
    [MemberRole.SECRETARY]: 'pi-file-edit',
    [MemberRole.MEMBER]: 'pi-user',
    [MemberRole.OBSERVER]: 'pi-eye'
};
