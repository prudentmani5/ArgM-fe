export class LoanApplicationDocument {
    id?: number;
    applicationId: number;
    application?: any;
    documentTypeId: number;
    documentType?: any;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    uploadedById?: number;
    uploadedBy?: any;
    uploadedAt?: string;
    isVerified: boolean;
    verifiedById?: number;
    verifiedBy?: any;
    verifiedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.applicationId = 0;
        this.documentTypeId = 0;
        this.fileName = '';
        this.fileUrl = '';
        this.isVerified = false;
    }
}
