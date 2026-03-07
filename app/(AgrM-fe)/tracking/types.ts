/**
 * TypeScript interfaces for Audit Trail tracking
 */

export interface TrackAuditTrail {
    id: number;
    actionDate: string;
    actionTime: string;
    actionTimestamp: string;
    userId: number | null;
    username: string | null;
    userFullName: string | null;
    userRole: string | null;
    branchId: number | null;
    branchName: string | null;
    actionTypeId: number;
    moduleId: number | null;
    entityTable: string;
    entityId: number | null;
    entityDescription: string | null;
    oldValues: string | null;
    newValues: string | null;
    changedFields: string | null;
    actionDescription: string | null;
    reason: string | null;
    relatedEntityTable: string | null;
    relatedEntityId: number | null;
    ipAddress: string | null;
    userAgent: string | null;
    requestUrl: string | null;
    requestMethod: string | null;
    sessionId: string | null;
    status: string;
    errorMessage: string | null;
}

export interface TrackAuditTrailSearchCriteria {
    userId?: number | null;
    username?: string | null;
    entityTable?: string | null;
    entityId?: number | null;
    actionTypeId?: number | null;
    moduleId?: number | null;
    branchId?: number | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface AuditTrailStats {
    totalSuccess: number;
    totalFailed: number;
    totalPending: number;
    userTotal?: number;
    startDate: string;
    endDate: string;
}

// Action Types Constants
export const ActionTypes: Record<number, string> = {
    1: 'Création',
    2: 'Lecture',
    3: 'Modification',
    4: 'Suppression',
    10: 'Connexion',
    11: 'Déconnexion',
    12: 'Échec de connexion',
    13: 'Changement mot de passe',
    14: 'Réinitialisation mot de passe',
    15: 'Compte verrouillé',
    16: 'Compte déverrouillé',
    20: 'Utilisateur créé',
    21: 'Utilisateur modifié',
    22: 'Utilisateur supprimé',
    23: 'Utilisateur activé',
    24: 'Utilisateur désactivé',
    25: 'Utilisateur approuvé',
    26: 'Utilisateur rejeté',
    27: 'Rôle assigné',
    28: 'Rôle révoqué',
    30: 'Import',
    31: 'Export',
    32: 'Impression',
    33: 'Téléchargement',
    34: 'Upload',
    40: 'Validation',
    41: 'Approbation',
    42: 'Rejet',
    43: 'Annulation',
    44: 'Soumission',
    45: 'Confirmation',
    50: 'Démarrage système',
    51: 'Arrêt système',
    52: 'Changement configuration',
    53: 'Sauvegarde',
    54: 'Restauration',
    55: 'Nettoyage',
    60: 'Traitement paiement',
    61: 'Rapprochement auto',
    62: 'Correspondance manuelle',
    63: 'Dé-rapprochement',
    64: 'Clôture compte',
    65: 'Mise en liste noire',
    66: 'Retrait liste noire',
    67: 'Changement statut',
    68: 'Suppression logique',
    69: 'Décaissement',
    90: 'Erreur',
    91: 'Exception',
    92: 'Violation sécurité'
};

// Module IDs Constants
export const ModuleIds: Record<number, string> = {
    1: 'Système',
    2: 'Authentification',
    3: 'Gestion Utilisateurs',
    4: 'Gestion Rôles',
    10: 'Groupe Client',
    11: 'Gestion Clients',
    12: 'Gestion Groupes',
    13: 'Gestion KYC',
    20: 'Facturation',
    21: 'Facturation',
    22: 'Validation',
    30: 'Paramètres',
    31: 'Tarifs',
    32: 'Paramétrage',
    40: 'Approvisionnement',
    41: 'Mouvement Stock',
    42: 'Inventaire',
    50: 'Comptabilité',
    51: 'Journal',
    52: 'Balance',
    60: 'Dispensaire',
    70: 'Caissier/Recette',
    71: 'Paiement',
    72: 'Rapport',
    80: 'Rapports',
    81: 'Génération PDF',
    82: 'Export',
    100: 'Épargne',
    101: 'Comptes Épargne',
    102: 'Livrets Épargne',
    103: 'Dépôts',
    104: 'Retraits',
    105: 'Dépôts à Terme',
    106: 'Tontine',
    107: 'Épargne Obligatoire',
    110: 'Crédit',
    111: 'Demandes Crédit',
    112: 'Analyses Crédit',
    113: 'Visites Terrain',
    114: 'Comité Crédit',
    115: 'Décaissement',
    116: 'Documents Crédit',
    120: 'Remboursement',
    121: 'Paiements Remb.',
    122: 'Échéanciers',
    123: 'Recouvrement',
    124: 'Contentieux',
    125: 'Restructuration',
    130: 'Produits Financiers',
    131: 'Produits de Prêt',
    132: 'Réf. Produits Fin.',
    140: 'Rapprochement',
    141: 'Relevés Bancaires',
    142: 'Écarts Rapprochement'
};

// Status options
export const StatusOptions = [
    { label: 'Tous', value: '' },
    { label: 'Succès', value: 'success' },
    { label: 'Échec', value: 'failed' },
    { label: 'En attente', value: 'pending' }
];

// Action Type options for dropdown
export const ActionTypeOptions = [
    { label: 'Tous', value: null },
    { label: 'Création', value: 1 },
    { label: 'Lecture', value: 2 },
    { label: 'Modification', value: 3 },
    { label: 'Suppression', value: 4 },
    { label: 'Connexion', value: 10 },
    { label: 'Déconnexion', value: 11 },
    { label: 'Échec de connexion', value: 12 },
    { label: 'Changement mot de passe', value: 13 },
    { label: 'Validation', value: 40 },
    { label: 'Approbation', value: 41 },
    { label: 'Rejet', value: 42 },
    { label: 'Export', value: 31 },
    { label: 'Import', value: 30 },
    { label: 'Traitement paiement', value: 60 },
    { label: 'Rapprochement auto', value: 61 },
    { label: 'Correspondance manuelle', value: 62 },
    { label: 'Changement statut', value: 67 },
    { label: 'Décaissement', value: 69 },
    { label: 'Mise en liste noire', value: 65 }
];

// Module options for dropdown
export const ModuleOptions = [
    { label: 'Tous', value: null },
    { label: 'Système', value: 1 },
    { label: 'Authentification', value: 2 },
    { label: 'Gestion Utilisateurs', value: 3 },
    { label: 'Groupe Client', value: 10 },
    { label: 'Gestion Clients', value: 11 },
    { label: 'Facturation', value: 20 },
    { label: 'Paramètres', value: 30 },
    { label: 'Approvisionnement', value: 40 },
    { label: 'Comptabilité', value: 50 },
    { label: 'Caissier/Recette', value: 70 },
    { label: 'Rapports', value: 80 },
    { label: 'Épargne', value: 100 },
    { label: 'Crédit', value: 110 },
    { label: 'Remboursement', value: 120 },
    { label: 'Produits Financiers', value: 130 },
    { label: 'Rapprochement', value: 140 }
];

export const getActionTypeName = (actionTypeId: number): string => {
    return ActionTypes[actionTypeId] || `Action #${actionTypeId}`;
};

export const getModuleName = (moduleId: number | null): string => {
    if (moduleId === null) return '-';
    return ModuleIds[moduleId] || `Module #${moduleId}`;
};

export const getStatusSeverity = (status: string): 'success' | 'danger' | 'warning' | 'info' | null => {
    switch (status?.toLowerCase()) {
        case 'success':
            return 'success';
        case 'failed':
            return 'danger';
        case 'pending':
            return 'warning';
        default:
            return 'info';
    }
};

export const getStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'success':
            return 'Succès';
        case 'failed':
            return 'Échec';
        case 'pending':
            return 'En attente';
        default:
            return status || '-';
    }
};
