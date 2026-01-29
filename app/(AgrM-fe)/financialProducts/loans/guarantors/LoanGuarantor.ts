export class LoanGuarantor {
    id?: number;
    loanId: number;
    guaranteeId?: number; // Link to LoanGuarantee if part of a guarantee

    // Guarantor identity
    guarantorClientId?: number; // If guarantor is a client
    guarantorName: string;
    guarantorIdNumber: string;
    guarantorPhone: string;
    guarantorEmail?: string;
    guarantorAddress?: string;

    // Relationship
    relationshipToClient: string;

    // Employment/Financial
    employerName?: string;
    monthlyIncome?: number;

    // Guarantee specifics
    guaranteedAmount: number;
    guaranteePercentage?: number;

    // Documents
    documentTypeId?: number;
    documentNumber?: string;
    documentUrl?: string;

    // Consent
    consentGiven: boolean;
    consentDate?: string;
    consentDocumentUrl?: string;

    // Status
    status: string; // ACTIVE, RELEASED, DEFAULTED

    // Release
    releaseDate?: string;

    // Created by
    createdById: number;

    // Audit
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.loanId = 0;
        this.guarantorName = '';
        this.guarantorIdNumber = '';
        this.guarantorPhone = '';
        this.relationshipToClient = '';
        this.guaranteedAmount = 0;
        this.consentGiven = false;
        this.status = 'ACTIVE';
        this.createdById = 0;
    }
}
