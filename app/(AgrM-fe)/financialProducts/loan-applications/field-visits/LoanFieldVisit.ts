export interface LoanFieldVisit {
    id: number;
    applicationId: number;
    visitType: VisitType;
    visitDate: Date | string;
    locationAddress: string;
    latitude: number | null;
    longitude: number | null;
    findings: string;
    recommendation: string;
    conductedById: number;
    conductedBy?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export enum VisitType {
    HOME = 'HOME',
    BUSINESS = 'BUSINESS',
    COLLATERAL = 'COLLATERAL',
    FOLLOW_UP = 'FOLLOW_UP'
}

export const VisitTypeLabels = {
    [VisitType.HOME]: 'Home Visit',
    [VisitType.BUSINESS]: 'Business Visit',
    [VisitType.COLLATERAL]: 'Collateral Visit',
    [VisitType.FOLLOW_UP]: 'Follow-up Visit'
};

export const VisitTypeIcons = {
    [VisitType.HOME]: 'pi-home',
    [VisitType.BUSINESS]: 'pi-building',
    [VisitType.COLLATERAL]: 'pi-shield',
    [VisitType.FOLLOW_UP]: 'pi-refresh'
};

export const VisitTypeColors = {
    [VisitType.HOME]: 'info',
    [VisitType.BUSINESS]: 'success',
    [VisitType.COLLATERAL]: 'warning',
    [VisitType.FOLLOW_UP]: 'help'
};
