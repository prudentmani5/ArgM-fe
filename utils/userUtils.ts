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

/**
 * Get the connected user's full name ("Firstname Lastname") — used to match
 * the `userAction` field stored on records that were created from the UI via
 * `getCurrentUser()` (firstname + lastname pattern).
 */
export const getConnectedUserFullName = (): string => {
    const user = getConnectedUser();
    if (!user) return '';
    const full = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    return full || user.email || '';
};

/**
 * Check whether the connected user has any of the given authority codes.
 * Safe to call before the user cookie is hydrated — returns false.
 */
export const hasAnyAuthorityCode = (codes: string[]): boolean => {
    try {
        const raw = Cookies.get('appUser');
        if (!raw) return false;
        const u: any = JSON.parse(raw);
        const auths: string[] = (u.authorities || u.role?.authorities || [])
            .map((a: any) => (typeof a === 'string' ? a : a?.code))
            .filter(Boolean);
        return codes.some((c) => auths.includes(c));
    } catch {
        return false;
    }
};

/**
 * Filter a list of records so the connected caissier sees ONLY records they
 * personally created/acted upon. Users holding any of `supervisorAuthorities`
 * (e.g. validators, managers) bypass the filter and see all records.
 *
 * @param records      records list to filter
 * @param supervisorAuthorities  authority codes that grant "see all" access
 * @param userActionKey  key name on each record holding the userAction value (default "userAction")
 */
export const filterOwnRecordsForCaissier = <T extends Record<string, any>>(
    records: T[],
    supervisorAuthorities: string[],
    userActionKey: string = 'userAction'
): T[] => {
    if (!Array.isArray(records)) return [];
    if (hasAnyAuthorityCode(supervisorAuthorities)) return records;
    const me = getConnectedUserFullName();
    const myEmail = getUserAction();
    if (!me && !myEmail) return records; // not hydrated yet — don't hide everything
    return records.filter((r) => {
        const v = r?.[userActionKey];
        if (!v) return false;
        return v === me || v === myEmail;
    });
};
