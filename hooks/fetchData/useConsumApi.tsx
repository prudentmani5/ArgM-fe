import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { json } from 'stream/consumers';
import { buildApiUrl } from '../../utils/apiConfig';

type ApiResponse = any; // Replace with your specific response type
type ApiError = {
    message: string;
    status?: number;
    data?: any;
};

const useConsumApi = (initialUrl: string) => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [callType, setCallType] = useState('default');

    // Get CSRF token from cookies
    const getCsrfToken = () => {
        return Cookies.get('XSRF-TOKEN');
    };

    // Get JWT token from cookies
    const getAuthToken = () => {
        return Cookies.get('token');
    };

    // Refresh token function
    const refreshToken = async (): Promise<string | null> => {
        try {
            const currentToken = getAuthToken();
            if (!currentToken) {
                return null;
            }

            const response = await fetch(buildApiUrl('/auth/refresh-token'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: currentToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            // Store new token in cookies
            if (data.token) {
                Cookies.set('token', data.token, { expires: 1 }); // 1 day expiration
                return data.token;
            }

            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    };

    // Handle unauthorized responses
    const handleUnauthorized = () => {
        console.error('🔴 UNAUTHORIZED - Clearing tokens');
        console.log('Current token before clearing:', Cookies.get('token'));
        console.log('Current appUser before clearing:', Cookies.get('appUser'));

        // Clear tokens and redirect to login
        Cookies.remove('token');
        Cookies.remove('appUser');
        Cookies.remove('XSRF-TOKEN');
        // window.location.href = '/auth/login2';
    };

    // Validate JWT token format
    const isValidJWT = (token: string | undefined): boolean => {
        if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
            return false;
        }
        // JWT should have exactly 2 periods (3 parts: header.payload.signature)
        const parts = token.split('.');
        return parts.length === 3 && parts.every(part => part.length > 0);
    };

    // Enhanced fetch wrapper with authentication and token refresh
    const authFetch = async (url: string, options: RequestInit = {}, skipAuth: boolean, responseType: 'json' | 'blob' = 'json', isRetry: boolean = false) => {
        const authToken = getAuthToken();
        const csrfToken = getCsrfToken();

        console.log('🔵 authFetch called:', {
            url,
            method: options.method || 'GET',
            skipAuth,
            isRetry,
            hasAuthToken: !!authToken,
            authToken: authToken ? `${authToken.substring(0, 20)}...` : 'NONE',
            isValidToken: authToken ? isValidJWT(authToken) : false
        });

        // Validate token format if auth is required
        if (!skipAuth && authToken && !isValidJWT(authToken)) {
            console.error('🔴 Invalid JWT token format detected in cookies. Clearing and redirecting to login.');
            handleUnauthorized();
            throw { message: 'Invalid authentication token. Please login again.', status: 401 };
        }

        // Set default headers
        const headers = new Headers(options.headers || {});
        // Always set Content-Type for requests with body (POST, PUT, etc.)
        if (options.body) {
            headers.set('Content-Type', 'application/json');
        }

        // Only add auth headers if not skipping authentication
        if (!skipAuth) {
            if (authToken && isValidJWT(authToken)) {
                headers.set('Authorization', `Bearer ${authToken}`);
                console.log('✅ Authorization header added');
            } else {
                console.warn('⚠️ No valid auth token found in cookies!');
            }
        } else {
            console.log('⏭️ Skipping authentication for this request');
        }

        // Merge with existing options
        const mergedOptions: RequestInit = {
            ...options,
            headers,
            credentials: 'include' // Important for cookies
        };

        try {
            const response = await fetch(url, mergedOptions);

            console.log('📥 Response received:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });

            // Handle unauthorized (401) responses with token refresh
            if (response.status === 401 && !isRetry && !skipAuth) {
                console.warn('🟡 401 Unauthorized - Token expired, attempting refresh...');

                // Try to refresh the token
                const newToken = await refreshToken();

                if (newToken) {
                    console.log('✅ Token refreshed successfully, retrying request...');
                    // Retry the original request with the new token
                    return await authFetch(url, options, skipAuth, responseType, true);
                } else {
                    // Token refresh failed, redirect to login
                    console.error('🔴 Token refresh failed');
                    handleUnauthorized();
                    throw { message: 'Session expired. Please login again.', status: 401 };
                }
            }

            // If still unauthorized after retry, redirect to login
            if (response.status === 401 && isRetry) {
                console.error('🔴 401 Unauthorized after retry - Authentication failed');
                handleUnauthorized();
                throw { message: 'Unauthorized', status: 401 };
            }

            // Handle other error statuses (including 401 with skipAuth)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('Response error:', errorData.message || errorData);

                // Extract error message from various possible formats
                let errorMessage = 'Request failed';
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }

                throw {
                    message: errorMessage,
                    status: response.status,
                    data: errorData
                };
            }

            if (responseType === 'blob') {
                const blob = await response.blob();
                console.log('✅ Blob response received');
                return blob;
            }

            const jsonData = await response.json();
            console.log('✅ JSON response received:', {
                hasData: !!jsonData,
                dataType: Array.isArray(jsonData) ? 'array' : typeof jsonData,
                dataLength: Array.isArray(jsonData) ? jsonData.length : 'N/A'
            });
            return jsonData;
        } catch (err) {
            console.error('🔴 authFetch error:', err);
            throw err;
        }
    };

    // Main fetch function
    const fetchData = async (
        dataModel: any,
        methodType: string = 'GET',
        url: string = initialUrl,
        callType: string = 'default',
        skipAuth: boolean = false,
        responseType: 'json' | 'blob' = 'json'
    ) => {
        setLoading(true);
        setError(null);
        setCallType(callType);

        try {
            const responseData = await authFetch(url, {
                method: methodType,
                body: dataModel !== null ? JSON.stringify(dataModel) : undefined
            }, skipAuth, responseType);

            setData(responseData);
        } catch (err) {
            setError(err as ApiError);
        } finally {
            setLoading(false);
        }
    };

    // Optional: Add a function to initialize CSRF token
    //   const initializeCsrfToken = async () => {
    //     try {
    //       await authFetch('http://localhost:8080/api/csrf-token', {
    //         method: 'GET'localhost
    //       }, true);
    //     } catch (err) {
    //       console.error('Failed to initialize CSRF token:', err);
    //     }
    //   };

    // Initialize CSRF token on first render (optional)
    //   useEffect(() => {
    //     // initializeCsrfToken();
    //   }, []);

    return { data, loading, error, fetchData, callType };
};

export default useConsumApi;