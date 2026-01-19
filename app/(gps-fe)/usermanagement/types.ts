// TypeScript interfaces matching backend DTOs for User Management

// ============================================
// Authority Types
// ============================================

export interface AuthorityResponse {
    id: number;
    code: string;
    description: string;
    category: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================
// AppUserRole Types
// ============================================

export interface AppUserRoleRequest {
    name: string;
    description?: string;
    authorityIds?: number[];
    active?: boolean;
}

export interface AppUserRoleResponse {
    id: number;
    name: string;
    description: string;
    authorities: AuthorityResponse[];
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================
// AppUser Types
// ============================================

export interface AppUserCreateRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    roleId: number;
    phoneNumber?: string;
    enabled?: boolean;
    approved?: boolean;
}

export interface AppUserUpdateRequest {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    roleId?: number;
    phoneNumber?: string;
    enabled?: boolean;
    approved?: boolean;
}

export interface AppUserResponse {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    roleId: number;
    roleName: string;
    roleDescription: string;
    authorities: string[];
    enabled: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    approved: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get full name from AppUserResponse
 */
export const getFullName = (user: AppUserResponse): string => {
    return `${user.firstname} ${user.lastname}`;
};

/**
 * Check if user has a specific authority
 * SUPER_ADMIN has access to all authorities automatically
 */
export const hasAuthority = (user: AppUserResponse, authority: string): boolean => {
    // Handle undefined or null authorities
    if (!user.authorities || !Array.isArray(user.authorities)) {
        return false;
    }
    // SUPER_ADMIN has access to everything
    if (user.authorities.includes('SUPER_ADMIN')) {
        return true;
    }
    return user.authorities.includes(authority);
};

/**
 * Check if user has at least one authority from the provided list
 * SUPER_ADMIN has access to all authorities automatically
 */
export const hasAnyAuthority = (user: AppUserResponse, authorities: string[]): boolean => {
    // Handle undefined or null authorities
    if (!user.authorities || !Array.isArray(user.authorities)) {
        return false;
    }
    // SUPER_ADMIN has access to everything
    if (user.authorities.includes('SUPER_ADMIN')) {
        return true;
    }
    return authorities.some(authority => user.authorities.includes(authority));
};

/**
 * Check if user is a super admin
 */
export const isSuperAdmin = (user: AppUserResponse): boolean => {
    // Handle undefined or null authorities
    if (!user.authorities || !Array.isArray(user.authorities)) {
        return false;
    }
    return user.authorities.includes('SUPER_ADMIN');
};

/**
 * Check if user account is fully active and approved
 */
export const isAccountFullyActive = (user: AppUserResponse): boolean => {
    return user.enabled &&
           user.accountNonExpired &&
           user.accountNonLocked &&
           user.credentialsNonExpired &&
           user.approved;
};

/**
 * Get account status label
 */
export const getAccountStatusLabel = (user: AppUserResponse): string => {
    if (!user.enabled) return 'Désactivé';
    if (!user.approved) return 'En attente d\'approbation';
    if (!user.accountNonExpired) return 'Expiré';
    if (!user.accountNonLocked) return 'Verrouillé';
    if (!user.credentialsNonExpired) return 'Mot de passe expiré';
    return 'Actif';
};

/**
 * Get account status severity for PrimeReact badges/tags
 */
export const getAccountStatusSeverity = (user: AppUserResponse): 'success' | 'warning' | 'danger' | 'info' => {
    if (!user.enabled || !user.accountNonLocked) return 'danger';
    if (!user.approved) return 'warning';
    if (!user.accountNonExpired || !user.credentialsNonExpired) return 'warning';
    return 'success';
};
