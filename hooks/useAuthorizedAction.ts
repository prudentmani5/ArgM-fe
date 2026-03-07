import { useCurrentUser } from './fetchData/useCurrentUser';
import { hasAuthority, hasAnyAuthority, AppUserResponse } from '../app/(AgrM-fe)/usermanagement/types';

interface UseAuthorizedActionReturn {
    can: (authority: string) => boolean;
    canAny: (authorities: string[]) => boolean;
    user: AppUserResponse | null;
    loading: boolean;
}

export const useAuthorizedAction = (): UseAuthorizedActionReturn => {
    const { user, loading } = useCurrentUser();

    const can = (authority: string): boolean => {
        if (!user) return false;
        return hasAuthority(user, authority);
    };

    const canAny = (authorities: string[]): boolean => {
        if (!user) return false;
        return hasAnyAuthority(user, authorities);
    };

    return { can, canAny, user, loading };
};
