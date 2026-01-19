// hooks/useCurrentUser.ts
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AppUserResponse } from '../../app/(gps-fe)/usermanagement/types';

interface UseCurrentUserReturn {
    user: AppUserResponse | null;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
    logout: () => void;
    refreshUser: () => void;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
    const [user, setUser] = useState<AppUserResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getUserFromCookies = (): AppUserResponse | null => {
        try {
            const appUserCookie = Cookies.get('appUser');

            if (!appUserCookie) {
                return null;
            }

            const parsedUser = JSON.parse(appUserCookie);
            console.log('AppUser loaded from cookies:', parsedUser);
            return parsedUser;
        } catch (err) {
            console.error('Error parsing user from cookies:', err);
            setError('Failed to load user data');
            return null;
        }
    };

    const loadUser = () => {
        setLoading(true);
        setError(null);
        
        try {
            const userData = getUserFromCookies();
            setUser(userData);
        } catch (err) {
            setError('Failed to load user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            Cookies.remove('appUser');
            Cookies.remove('token');
            Cookies.remove('XSRF-TOKEN');
            Cookies.remove('currentExercice');
            setUser(null);
            setError(null);

            // Redirect to login page using window.location to force full page reload
            // This avoids chunk loading errors after builds
            window.location.href = '/auth/login2';
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Failed to logout');
        }
    };

    const refreshUser = () => {
        loadUser();
    };

    useEffect(() => {
        loadUser();
    }, []);

    return {
        user,
        loading,
        error,
        isLoggedIn: user !== null,
        logout,
        refreshUser
    };
};