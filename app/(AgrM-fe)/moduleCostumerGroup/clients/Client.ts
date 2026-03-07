// Enums
export enum ClientType {
    INDIVIDUAL = 'INDIVIDUAL',
    BUSINESS = 'BUSINESS',
    JOINT_ACCOUNT = 'JOINT_ACCOUNT'
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

export interface RelationshipType {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    isActive: boolean;
}

export interface EmergencyContact {
    id?: number;
    contactName: string;
    relationshipType?: RelationshipType;
    relationshipTypeId?: number;
    relationshipOther: string;
    phonePrimary: string;
    phoneSecondary: string;
    address: string;
    isPrimary: boolean;
    isActive: boolean;
    contactFor: string;
}

export class EmergencyContactClass implements EmergencyContact {
    id?: number;
    contactName: string;
    relationshipTypeId?: number;
    relationshipOther: string;
    phonePrimary: string;
    phoneSecondary: string;
    address: string;
    isPrimary: boolean;
    isActive: boolean;
    contactFor: string;

    constructor(contactFor: string = 'PRINCIPAL') {
        this.contactName = '';
        this.relationshipOther = '';
        this.phonePrimary = '';
        this.phoneSecondary = '';
        this.address = '';
        this.isPrimary = false;
        this.isActive = true;
        this.contactFor = contactFor;
    }
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

    // Photo & Signature
    photoPath: string;
    signatureImagePath: string;

    // Co-titulaire (JOINT_ACCOUNT)
    secondLastName: string;
    secondFirstName: string;
    secondGender: Gender;
    secondDateOfBirth: string;
    secondPlaceOfBirth: string;
    secondNationalityId?: number;
    secondPhonePrimary: string;
    secondIdDocumentTypeId?: number;
    secondIdDocumentNumber: string;
    secondIdIssueDate: string;
    secondIdExpiryDate: string;
    secondIdDocumentScanPath: string;
    secondPhotoPath: string;
    secondSignatureImagePath: string;

    // Co-titulaire Address
    secondProvinceId?: number;
    secondCommuneId?: number;
    secondZoneId?: number;
    secondCollineId?: number;
    secondStreetAddress: string;

    // Emergency Contacts (Personne de Contact)
    emergencyContacts: EmergencyContact[];

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
        this.signatureImagePath = '';
        this.secondLastName = '';
        this.secondFirstName = '';
        this.secondGender = Gender.M;
        this.secondDateOfBirth = '';
        this.secondPlaceOfBirth = '';
        this.secondPhonePrimary = '';
        this.secondIdDocumentNumber = '';
        this.secondIdIssueDate = '';
        this.secondIdExpiryDate = '';
        this.secondIdDocumentScanPath = '';
        this.secondPhotoPath = '';
        this.secondSignatureImagePath = '';
        this.secondStreetAddress = '';
        this.emergencyContacts = [];
        this.notes = '';
        this.userAction = '';
    }
}
