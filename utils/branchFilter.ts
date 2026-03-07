import Cookies from 'js-cookie';

/**
 * Check if the current user should be filtered by branch.
 * Returns { filter: true, branchId } if user has a branch and does NOT have VIEW_ALL_BRANCHES/SUPER_ADMIN authority.
 * Returns { filter: false, branchId: null } if user should see all branches.
 */
export function shouldFilterByBranch(): { filter: boolean; branchId: number | null } {
    try {
        const appUserStr = Cookies.get('appUser');
        if (appUserStr) {
            const appUser = JSON.parse(appUserStr);
            const branchId = appUser.branchId || null;
            const auths: string[] = appUser.authorities || [];
            const canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES')
                || auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
            if (branchId && !canViewAll) {
                return { filter: true, branchId };
            }
        }
    } catch (e) { /* ignore */ }
    return { filter: false, branchId: null };
}
