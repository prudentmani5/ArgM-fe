import Cookies from 'js-cookie';

/**
 * User Utilities
 * Helper functions for managing connected user information
 */

export interface ConnectedUser {
    id?: number;
    email?: string;
    firstname?: string;
    lastname?: string;
    fullName?: string;
    roleId?: number;
    roleName?: string;
}

/**
 * Get the connected user from cookies
 * @returns ConnectedUser object or null if not logged in
 */
export const getConnectedUser = (): ConnectedUser | null => {
    try {
        const appUserCookie = Cookies.get('appUser');
        if (!appUserCookie) {
            return null;
        }
        const user = JSON.parse(appUserCookie);
        return {
            ...user,
            fullName: user.firstname && user.lastname
                ? `${user.firstname} ${user.lastname}`
                : user.email
        };
    } catch (error) {
        console.error('Error parsing appUser cookie:', error);
        return null;
    }
};

/**
 * Get the connected user's email for userAction field
 * @returns User email or 'anonymous' if not logged in
 */
export const getUserAction = (): string => {
    const user = getConnectedUser();
    return user?.email || 'anonymous';
};

/**
 * Check if user is logged in
 * @returns boolean
 */
export const isLoggedIn = (): boolean => {
    const token = Cookies.get('token');
    const appUser = Cookies.get('appUser');
    return !!token && !!appUser;
};
