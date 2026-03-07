export class SignatoryMember {
    id?: number;
    clientId?: number;
    firstName: string;
    lastName: string;
    functionRole: string;
    phonePrimary: string;
    phoneSecondary: string;
    email: string;
    idDocumentTypeId?: number;
    idDocumentType?: { id: number; name: string };
    idDocumentNumber: string;
    idIssueDate: string;
    idExpiryDate: string;
    idDocumentScanPath: string;
    signatureImagePath: string;
    photoPath: string;
    address: string;
    isActive: boolean;
    notes: string;
    // Contact Person
    contactPersonName: string;
    contactPersonRelationshipTypeId?: number;
    contactPersonRelationshipType?: { id: number; name: string; nameFr: string };
    contactPersonRelationshipOther: string;
    contactPersonPhone: string;
    contactPersonPhoneSecondary: string;
    contactPersonAddress: string;
    userAction: string;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.functionRole = '';
        this.phonePrimary = '';
        this.phoneSecondary = '';
        this.email = '';
        this.idDocumentNumber = '';
        this.idIssueDate = '';
        this.idExpiryDate = '';
        this.idDocumentScanPath = '';
        this.signatureImagePath = '';
        this.photoPath = '';
        this.address = '';
        this.isActive = true;
        this.notes = '';
        this.contactPersonName = '';
        this.contactPersonRelationshipOther = '';
        this.contactPersonPhone = '';
        this.contactPersonPhoneSecondary = '';
        this.contactPersonAddress = '';
        this.userAction = '';
    }
}

export const FUNCTION_ROLE_OPTIONS = [
    { label: 'Gerant', value: 'Gerant' },
    { label: 'Associe', value: 'Associe' },
    { label: 'Directeur', value: 'Directeur' },
    { label: 'Secretaire', value: 'Secretaire' },
    { label: 'Tresorier', value: 'Tresorier' },
    { label: 'President', value: 'President' },
    { label: 'Vice-President', value: 'Vice-President' },
    { label: 'Commissaire aux comptes', value: 'Commissaire aux comptes' },
    { label: 'Autre', value: 'Autre' }
];
