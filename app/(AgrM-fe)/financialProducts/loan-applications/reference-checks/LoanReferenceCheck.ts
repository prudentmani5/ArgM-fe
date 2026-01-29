export interface LoanReferenceCheck {
    id: number;
    applicationId: number;
    referenceName: string;
    relationshipToApplicant: string;
    contactPhone: string;
    contactEmail: string;
    checkMethod: CheckMethod;
    characterAssessment: string;
    paymentHistoryFeedback: string;
    businessRelationshipFeedback: string;
    isPositive: boolean;
    conductedById: number;
    conductedBy?: string;
    notes: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export enum CheckMethod {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    IN_PERSON = 'IN_PERSON',
    LETTER = 'LETTER',
    CRB_REPORT = 'CRB_REPORT'
}

export const CheckMethodLabels = {
    [CheckMethod.PHONE]: 'Phone Call',
    [CheckMethod.EMAIL]: 'Email',
    [CheckMethod.IN_PERSON]: 'In-Person',
    [CheckMethod.LETTER]: 'Letter',
    [CheckMethod.CRB_REPORT]: 'CRB Report'
};

export const CheckMethodIcons = {
    [CheckMethod.PHONE]: 'pi-phone',
    [CheckMethod.EMAIL]: 'pi-envelope',
    [CheckMethod.IN_PERSON]: 'pi-users',
    [CheckMethod.LETTER]: 'pi-file',
    [CheckMethod.CRB_REPORT]: 'pi-file-pdf'
};
