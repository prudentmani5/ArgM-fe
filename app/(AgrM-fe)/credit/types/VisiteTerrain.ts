import { LieuVisite, RecommandationVisite, StatutLogement } from './CreditTypes';

// ==================== VISITE TERRAIN ====================
export interface VisiteTerrain {
    id?: number;
    applicationId?: number;
    application?: any;
    agentId?: number;
    agent?: any;

    // Planification
    scheduledDate?: string;
    scheduledTime?: string;

    // Réalisation
    actualDate?: string;
    actualTime?: string;
    visitStatus?: string;

    // Évaluation domicile
    housingStatusId?: number;
    housingStatus?: StatutLogement;
    housingCondition?: string;
    numberOfRooms?: number;
    hasElectricity: boolean;
    hasWater: boolean;
    neighborhoodDescription?: string;

    // Évaluation activité économique
    businessVerified: boolean;
    stockVerified: boolean;
    stockValueEstimated?: number;
    customerFlowObserved?: string;
    businessCondition?: string;

    // Évaluation des garanties
    guaranteesVerified: boolean;
    guaranteesCondition?: string;
    guaranteesValue?: number;

    // Conclusion
    recommendationId?: number;
    recommendation?: RecommandationVisite;
    recommendedAmount?: number;
    recommendedDuration?: number;
    overallAssessment?: string;
    positivePoints?: string;
    riskPoints?: string;
    agentComments?: string;

    // GPS
    gpsLatitude?: string;
    gpsLongitude?: string;

    // Sufficiency and tracking
    guaranteesSufficient?: boolean;
    userAction?: string;

    createdAt?: string;
    updatedAt?: string;
}

export class VisiteTerrainClass implements VisiteTerrain {
    id?: number;
    applicationId?: number;
    agentId?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    actualDate?: string;
    actualTime?: string;
    visitStatus?: string = 'PLANNED';
    housingStatusId?: number;
    housingCondition?: string = '';
    numberOfRooms?: number = 0;
    hasElectricity: boolean = false;
    hasWater: boolean = false;
    neighborhoodDescription?: string = '';
    businessVerified: boolean = false;
    stockVerified: boolean = false;
    stockValueEstimated?: number = 0;
    customerFlowObserved?: string = '';
    businessCondition?: string = '';
    guaranteesVerified: boolean = false;
    guaranteesCondition?: string = '';
    guaranteesValue?: number = 0;
    recommendationId?: number;
    recommendedAmount?: number = 0;
    recommendedDuration?: number = 0;
    overallAssessment?: string = '';
    positivePoints?: string = '';
    riskPoints?: string = '';
    agentComments?: string = '';
    gpsLatitude?: string = '';
    gpsLongitude?: string = '';
    guaranteesSufficient?: boolean = true;
    userAction?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<VisiteTerrain>) {
        Object.assign(this, init);
    }
}

// Statuts de visite
export const StatutsVisite = [
    { code: 'PLANNED', label: 'Planifiée', color: 'info' },
    { code: 'IN_PROGRESS', label: 'En cours', color: 'warning' },
    { code: 'COMPLETED', label: 'Terminée', color: 'success' },
    { code: 'CANCELLED', label: 'Annulée', color: 'danger' },
    { code: 'RESCHEDULED', label: 'Reportée', color: 'warning' }
];

// Conditions (état)
export const EtatsCondition = [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Bon' },
    { code: 'AVERAGE', label: 'Moyen' },
    { code: 'POOR', label: 'Mauvais' },
    { code: 'VERY_POOR', label: 'Très mauvais' }
];

// ==================== LIEU DE VISITE (DÉTAIL) ====================
export interface LieuVisiteDetail {
    id?: number;
    visitId?: number;
    visit?: VisiteTerrain;
    locationTypeId?: number;
    locationType?: LieuVisite;

    // Adresse
    address?: string;
    commune?: string;
    colline?: string;

    // GPS
    gpsLatitude?: string;
    gpsLongitude?: string;

    // Observations
    observations?: string;
    conditionScore?: number;

    createdAt?: string;
    updatedAt?: string;
}

export class LieuVisiteDetailClass implements LieuVisiteDetail {
    id?: number;
    visitId?: number;
    locationTypeId?: number;
    address?: string = '';
    commune?: string = '';
    colline?: string = '';
    gpsLatitude?: string = '';
    gpsLongitude?: string = '';
    observations?: string = '';
    conditionScore?: number = 0;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<LieuVisiteDetail>) {
        Object.assign(this, init);
    }
}

// ==================== PHOTO DE VISITE ====================
export interface PhotoVisite {
    id?: number;
    visitId?: number;
    visit?: VisiteTerrain;
    visitLocationId?: number;
    visitLocation?: LieuVisiteDetail;

    photoPath?: string;
    description?: string;
    photoType?: string;
    takenAt?: string;

    createdAt?: string;
    updatedAt?: string;
}

export class PhotoVisiteClass implements PhotoVisite {
    id?: number;
    visitId?: number;
    visitLocationId?: number;
    photoPath?: string = '';
    description?: string = '';
    photoType?: string = '';
    takenAt?: string;
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<PhotoVisite>) {
        Object.assign(this, init);
    }
}

// Types de photo
export const TypesPhoto = [
    { code: 'FACADE', label: 'Façade' },
    { code: 'INTERIOR', label: 'Intérieur' },
    { code: 'BUSINESS', label: 'Activité commerciale' },
    { code: 'STOCK', label: 'Stock' },
    { code: 'GUARANTEE', label: 'Garantie' },
    { code: 'NEIGHBORHOOD', label: 'Voisinage' },
    { code: 'OTHER', label: 'Autre' }
];

// ==================== ENTRETIEN CLIENT ====================
export interface EntretienClient {
    id?: number;
    visitId?: number;
    visit?: VisiteTerrain;
    fieldVisit?: any;

    // Date et lieu
    interviewDate?: string;
    interviewLocation?: string;

    // Présences
    clientPresent: boolean;
    spousePresent: boolean;

    // Confirmations
    incomeConfirmed: boolean;
    expensesConfirmed: boolean;
    purposeConfirmed: boolean;

    // Project Discussion (from backend)
    projectUnderstanding?: string;
    experienceInActivity?: string;
    marketKnowledge?: string;
    competitionAwareness?: string;

    // Financial Discussion (from backend)
    loanAmountJustification?: string;
    repaymentPlanDiscussion?: string;
    otherDebtsDisclosed?: string;

    // Character Assessment (from backend)
    communicationQuality?: string;
    honestyAssessment?: string;
    motivationLevel?: string;

    // Évaluation
    clientAttitude?: string;
    cooperationLevel?: string;
    questionnaireCompleted: boolean;

    // Notes
    notes?: string;
    generalNotes?: string;
    userAction?: string;

    createdAt?: string;
    updatedAt?: string;
}

export class EntretienClientClass implements EntretienClient {
    id?: number;
    visitId?: number;
    interviewDate?: string;
    interviewLocation?: string = '';
    clientPresent: boolean = false;
    spousePresent: boolean = false;
    incomeConfirmed: boolean = false;
    expensesConfirmed: boolean = false;
    purposeConfirmed: boolean = false;
    // Project Discussion
    projectUnderstanding?: string = '';
    experienceInActivity?: string = '';
    marketKnowledge?: string = '';
    competitionAwareness?: string = '';
    // Financial Discussion
    loanAmountJustification?: string = '';
    repaymentPlanDiscussion?: string = '';
    otherDebtsDisclosed?: string = '';
    // Character Assessment
    communicationQuality?: string = '';
    honestyAssessment?: string = '';
    motivationLevel?: string = '';
    // Evaluation
    clientAttitude?: string = '';
    cooperationLevel?: string = '';
    questionnaireCompleted: boolean = false;
    notes?: string = '';
    generalNotes?: string = '';
    userAction?: string = '';
    createdAt?: string;
    updatedAt?: string;

    constructor(init?: Partial<EntretienClient>) {
        Object.assign(this, init);
    }
}

// Attitudes client
export const AttitudesClient = [
    { code: 'COOPERATIVE', label: 'Coopératif' },
    { code: 'NEUTRAL', label: 'Neutre' },
    { code: 'RESERVED', label: 'Réservé' },
    { code: 'EVASIVE', label: 'Évasif' },
    { code: 'HOSTILE', label: 'Hostile' }
];

// Niveaux de coopération
export const NiveauxCooperation = [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Bon' },
    { code: 'AVERAGE', label: 'Moyen' },
    { code: 'POOR', label: 'Faible' },
    { code: 'VERY_POOR', label: 'Très faible' }
];
