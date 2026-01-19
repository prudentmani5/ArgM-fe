import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { buildApiUrl } from '../../utils/apiConfig';

type ApiResponse = any; // Replace with your specific response type
type ApiError = {
    message: string;
    status?: number;
    data?: any;
};

const useConsumApiWithPromise = (initialUrl: string) => {
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

    // Token refresh flag to prevent multiple simultaneous refresh attempts
    let isRefreshing = false;
    let refreshSubscribers: ((token: string) => void)[] = [];

    // Add subscribers that will wait for token refresh
    const subscribeTokenRefresh = (callback: (token: string) => void) => {
        refreshSubscribers.push(callback);
    };

    // Notify all subscribers when token is refreshed
    const onTokenRefreshed = (token: string) => {
        refreshSubscribers.forEach(callback => callback(token));
        refreshSubscribers = [];
    };

    // Refresh the token using the backend endpoint
    const refreshAuthToken = async (): Promise<string | null> => {
        try {
            const currentToken = getAuthToken();
            if (!currentToken) {
                console.error('No token available to refresh');
                return null;
            }

            const response = await fetch(buildApiUrl('/auth/refresh-token'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ token: currentToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const newToken = data.token;

            if (newToken) {
                // Update the token in cookies
                Cookies.set('token', newToken, { expires: 1 }); // 1 day expiration

                // Update user data if provided
                if (data.appUser) {
                    Cookies.set('appUser', JSON.stringify(data.appUser), { expires: 1 });
                }

                console.log('Token refreshed successfully');
                return newToken;
            }

            return null;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
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

    // Handle unauthorized responses
    const handleUnauthorized = async (): Promise<string | null> => {
        // If already refreshing, wait for the refresh to complete
        if (isRefreshing) {
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    resolve(token);
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAuthToken();

            if (newToken) {
                isRefreshing = false;
                onTokenRefreshed(newToken);
                return newToken;
            } else {
                // Refresh failed, clear tokens and redirect to login
                Cookies.remove('token');
                Cookies.remove('appUser');
                Cookies.remove('XSRF-TOKEN');

                window.location.href = '/auth/login2';
                return null;
            }
        } catch (error) {
            isRefreshing = false;
            // Clear tokens and redirect to login
            Cookies.remove('token');
            Cookies.remove('appUser');
            Cookies.remove('XSRF-TOKEN');

            window.location.href = '/auth/login2';
            return null;
        }
    };

    // Enhanced fetch wrapper with authentication
    const authFetch = async (url: string, options: RequestInit = {}, skipAuth: boolean = false, retryCount: number = 0): Promise<any> => {
        const authToken = getAuthToken();
        const csrfToken = getCsrfToken();

        // Validate token format if auth is required
        if (!skipAuth && authToken && !isValidJWT(authToken)) {
            console.error('🔴 Invalid JWT token format detected in cookies. Clearing and redirecting to login.');
            Cookies.remove('token');
            Cookies.remove('appUser');
            Cookies.remove('XSRF-TOKEN');
            window.location.href = '/auth/login2';
            throw { message: 'Invalid authentication token. Please login again.', status: 401 };
        }

        // Set default headers
        const headers = new Headers(options.headers || {});
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        // Only add auth headers if not skipping authentication
        if (!skipAuth) {
            if (authToken && isValidJWT(authToken)) {
                headers.set('Authorization', `Bearer ${authToken}`);
            }

            if (csrfToken && options.method && options.method !== 'GET') {
                headers.set('X-XSRF-TOKEN', csrfToken);
            }
        }

        // Merge with existing options
        const mergedOptions: RequestInit = {
            ...options,
            headers,
            credentials: 'include' // Important for cookies
        };

        try {
            const response = await fetch(url, mergedOptions);

            // Handle unauthorized (401) responses
            if (response.status === 401 && !skipAuth && retryCount === 0) {
                console.log('Received 401, attempting token refresh...');
                const newToken = await handleUnauthorized();

                if (newToken) {
                    // Retry the request with the new token
                    console.log('Retrying request with refreshed token...');
                    return authFetch(url, options, skipAuth, retryCount + 1);
                } else {
                    throw { message: 'Unauthorized - Token refresh failed', status: 401 };
                }
            } else if (response.status === 401) {
                // If we already retried or skipAuth is true, don't retry again
                throw { message: 'Unauthorized', status: 401 };
            }

            // Handle other error statuses
            if (!response.ok) {
                let errorData: any = {};
                let errorMessage = 'Request failed';
                
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } else {
                        // If not JSON, get text content for debugging
                        const textContent = await response.text();
                        console.error('Non-JSON response received:', {
                            status: response.status,
                            statusText: response.statusText,
                            contentType,
                            content: textContent.substring(0, 200) + '...' // Log first 200 chars
                        });
                        errorMessage = `Server returned ${response.status} ${response.statusText}`;
                        errorData = { rawContent: textContent };
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                    errorMessage = `Server returned ${response.status} ${response.statusText}`;
                }

                throw {
                    message: errorMessage,
                    status: response.status,
                    data: errorData
                };
            }

            // Handle successful responses
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    // If response is not JSON, return text content
                    const textContent = await response.text();
                    console.warn('Non-JSON response received for successful request:', {
                        url,
                        status: response.status,
                        contentType,
                        content: textContent.substring(0, 200) + '...'
                    });
                    
                    // Try to parse as JSON anyway (some servers don't set correct content-type)
                    try {
                        return JSON.parse(textContent);
                    } catch {
                        // If it's not JSON, return as text or throw error based on what you expect
                        throw {
                            message: 'Server returned non-JSON response',
                            status: response.status,
                            data: { rawContent: textContent }
                        };
                    }
                }
            } catch (parseError) {
                console.error('Error parsing successful response:', parseError);
                throw {
                    message: 'Failed to parse server response',
                    status: response.status,
                    data: { parseError: parseError.message }
                };
            }
        } catch (err) {
            // If it's a network error or other fetch error
            if (err instanceof TypeError) {
                throw {
                    message: 'Network error or CORS issue',
                    status: 0,
                    data: { originalError: err.message }
                };
            }
            throw err;
        }
    };

    // Main fetch function that updates state AND returns a promise
    const fetchData = async (options?: {
        data?: any;
        method?: string;
        url?: string;
        callType?: string;
        skipAuth?: boolean;
    }): Promise<any> => {
        const {
            data: dataModel = null,
            method: methodType = 'GET',
            url = initialUrl,
            callType = 'default',
            skipAuth = false
        } = options || {};

        setLoading(true);
        setError(null);
        setCallType(callType);

        try {
            const responseData = await authFetch(url, {
                method: methodType,
                body: dataModel !== null ? JSON.stringify(dataModel) : undefined
            }, skipAuth);
            console.log('Response Data:');
            console.log(JSON.stringify(responseData));

            setData(responseData);
            return responseData; // Return the data as a promise resolution
        } catch (err) {
            const apiError = err as ApiError;
            console.log(JSON.stringify(err));
            setError(apiError);
            throw apiError; // Re-throw the error so it can be caught by promise consumers
        } finally {
            setLoading(false);
        }
    };

    // Legacy function for backward compatibility (with positional parameters)
    const fetchDataLegacy = async (
        dataModel: any = null,
        methodType: string = 'GET',
        url: string = initialUrl,
        callType: string = 'default',
        skipAuth: boolean = false
    ): Promise<any> => {
        return fetchData({
            data: dataModel,
            method: methodType,
            url,
            callType,
            skipAuth
        });
    };

    // Alternative function that ONLY returns a promise without updating state
    const fetchDataPromise = async (options?: {
        data?: any;
        method?: string;
        url?: string;
        skipAuth?: boolean;
    }): Promise<any> => {
        const {
            data: dataModel = null,
            method: methodType = 'GET',
            url = initialUrl,
            skipAuth = false
        } = options || {};

        return await authFetch(url, {
            method: methodType,
            body: dataModel !== null ? JSON.stringify(dataModel) : undefined
        }, skipAuth);
    };

    // Convenience methods for common HTTP operations that return promises
    const get = (url: string = initialUrl, skipAuth: boolean = false): Promise<any> => {
        return fetchData({ url, method: 'GET', skipAuth, callType: 'get' });
    };

    const post = (data: any, url: string = initialUrl, skipAuth: boolean = false): Promise<any> => {
        return fetchData({ data, url, method: 'POST', skipAuth, callType: 'post' });
    };

    const put = (data: any, url: string = initialUrl, skipAuth: boolean = false): Promise<any> => {
        return fetchData({ data, url, method: 'PUT', skipAuth, callType: 'put' });
    };

    const del = (url: string = initialUrl, skipAuth: boolean = false): Promise<any> => {
        return fetchData({ url, method: 'DELETE', skipAuth, callType: 'delete' });
    };

    const patch = (data: any, url: string = initialUrl, skipAuth: boolean = false): Promise<any> => {
        return fetchData({ data, url, method: 'PATCH', skipAuth, callType: 'patch' });
    };

    return { 
        // State values
        data, 
        loading, 
        error, 
        callType,
        
        // Main functions
        fetchData,           // Updates state AND returns promise (new object-based API)
        fetchDataLegacy,     // Legacy function with positional parameters
        fetchDataPromise,    // Only returns promise, no state updates
        
        // Convenience methods (all return promises and update state)
        get,
        post,
        put,
        delete: del,
        patch,
        
        // Utility functions
        authFetch           // Direct access to the auth fetch wrapper
    };
};

export default useConsumApiWithPromise;