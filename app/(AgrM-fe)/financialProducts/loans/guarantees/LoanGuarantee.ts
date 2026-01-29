export class LoanGuarantee {
    id?: number;
    loanId: number;
    guaranteeTypeId: number;

    // Guarantee details
    description: string;
    estimatedValue: number;
    verifiedValue?: number;

    // Collateral specifics
    collateralLocation?: string;
    serialNumber?: string;
    registrationNumber?: string;

    // Ownership
    ownerName: string;
    ownerClientId?: number;
    relationshipToClient?: string;

    // Verification
    verificationDate?: string;
    verifiedById?: number;
    verificationNotes?: string;

    // Documents
    documentTypeId?: number;
    documentNumber?: string;
    documentUrl?: string;

    // Status
    status: string; // PENDING, VERIFIED, RELEASED, SEIZED

    // Release
    releaseDate?: string;
    releasedById?: number;

    // Created by
    createdById: number;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.guaranteeTypeId = 0;
        this.description = '';
        this.estimatedValue = 0;
        this.ownerName = '';
        this.status = 'PENDING';
        this.createdById = 0;
    }
}
