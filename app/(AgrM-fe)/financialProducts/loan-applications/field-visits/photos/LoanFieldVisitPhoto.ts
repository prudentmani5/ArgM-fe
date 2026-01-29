export interface LoanFieldVisitPhoto {
    id: number;
    fieldVisitId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    caption: string;
    uploadedById: number;
    uploadedBy?: string;
    uploadedAt?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
