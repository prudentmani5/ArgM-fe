// Enums
export enum ClientType {
    INDIVIDUAL = 'INDIVIDUAL',
    BUSINESS = 'BUSINESS'
}

export enum Gender {
    M = 'M',
    F = 'F'
}

export enum ClientStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    CLOSED = 'CLOSED',
    BLACKLISTED = 'BLACKLISTED'
}

export enum RiskRating {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH'
}

// Reference Types
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
    provinceName?: string;
    isActive: boolean;
}

export interface Zone {
    id?: number;
    code: string;
    name: string;
    communeId?: number;
    communeName?: string;
    isActive: boolean;
}

export interface Colline {
    id?: number;
    code: string;
    name: string;
    zoneId?: number;
    zoneName?: string;
    isActive: boolean;
}

export interface Nationality {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface IdDocumentType {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface ActivitySector {
    id?: number;
    code: string;
    name: string;
    description?: string;
    parentId?: number;
    isActive: boolean;
}

export interface MaritalStatus {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface EducationLevel {
    id?: number;
    code: string;
    name: string;
    rank?: number;
    isActive: boolean;
}

export interface ClientCategory {
    id?: number;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface HousingType {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface Branch {
    id?: number;
    code: string;
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
}

// Client Class
export class Client {
    id?: number;
    clientNumber: string;
    clientType: ClientType;

    // Personal Info (Individual)
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    gender: Gender;

    // Business Info
    businessName: string;
    businessRegistrationNumber: string;
    businessType: string;
    dateOfIncorporation: string;

    // Identity
    nationalityId?: number;
    idDocumentTypeId?: number;
    idDocumentNumber: string;
    idDocumentIssueDate: string;
    idDocumentExpiryDate: string;
    idDocumentIssuedBy: string;
    idDocumentScanPath: string;

    // Contact
    phonePrimary: string;
    phoneSecondary: string;
    email: string;

    // Address
    provinceId?: number;
    communeId?: number;
    zoneId?: number;
    collineId?: number;
    streetAddress: string;

    // Professional (Frontend form names)
    occupation: string;
    employer: string;
    monthlyIncome: number;
    activitySectorId?: number;
    educationLevelId?: number;
    maritalStatusId?: number;
    numberOfDependents: number;
    housingTypeId?: number;

    // Professional (Backend field names - for data loaded from API)
    profession?: string;
    employerName?: string;
    dependentsCount?: number;
    idIssuePlace?: string;

    // ID Document (Backend field names - for data loaded from API)
    idIssueDate?: string;
    idExpiryDate?: string;

    // Classification
    clientCategoryId?: number;
    riskRating: RiskRating;

    // Assignment
    assignedOfficerId?: number;
    branchId?: number;

    // Status
    status: ClientStatus;

    // Photo
    photoPath: string;

    // Notes
    notes: string;

    // User action tracking
    userAction: string;

    constructor() {
        this.clientNumber = '';
        this.clientType = ClientType.INDIVIDUAL;
        this.firstName = '';
        this.lastName = '';
        this.middleName = '';
        this.dateOfBirth = '';
        this.placeOfBirth = '';
        this.gender = Gender.M;
        this.businessName = '';
        this.businessRegistrationNumber = '';
        this.businessType = '';
        this.dateOfIncorporation = '';
        this.idDocumentNumber = '';
        this.idDocumentIssueDate = '';
        this.idDocumentExpiryDate = '';
        this.idDocumentIssuedBy = '';
        this.idDocumentScanPath = '';
        this.phonePrimary = '';
        this.phoneSecondary = '';
        this.email = '';
        this.streetAddress = '';
        this.occupation = '';
        this.employer = '';
        this.monthlyIncome = 0;
        this.numberOfDependents = 0;
        this.riskRating = RiskRating.LOW;
        this.status = ClientStatus.PENDING;
        this.photoPath = '';
        this.notes = '';
        this.userAction = '';
    }
}
