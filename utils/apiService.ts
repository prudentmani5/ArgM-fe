// utils/apiService.ts

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    code?: string;
}

export class ApiService {
    private static getToken(): string | null {
        return Cookies.get('token') || null;
    }

    private static getHeaders(): HeadersInit {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'X-Performed-By': this.getUserAction()
        };
    }

    private static getUserAction(): string {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return appUser?.username || appUser?.email || 'SYSTEM';
            }
        } catch (e) {
            console.warn('Impossible de récupérer l\'utilisateur connecté');
        }
        return 'SYSTEM';
    }

    static async request<T = any>(
        url: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                // La réponse n'est pas du JSON
            }

            if (!response.ok) {
                // ✅ Gestion centralisée des erreurs
                const errorMessage = data?.message || `Erreur ${response.status}`;
                const errorCode = data?.code || 'UNKNOWN_ERROR';

                // ✅ Log des erreurs
                console.error(`❌ API Error [${errorCode}]:`, {
                    url,
                    status: response.status,
                    message: errorMessage,
                    data
                });

                return {
                    success: false,
                    error: errorMessage,
                    statusCode: response.status,
                    code: errorCode
                };
            }

            return {
                success: true,
                data: data as T,
                statusCode: response.status
            };

        } catch (error) {
            console.error('❌ Network Error:', error);
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    // ✅ Méthodes spécifiques
    static async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(url, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    static async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(url, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    static async get<T = any>(url: string): Promise<ApiResponse<T>> {
        return this.request<T>(url, { method: 'GET' });
    }

    static async delete<T = any>(url: string): Promise<ApiResponse<T>> {
        return this.request<T>(url, { method: 'DELETE' });
    }
}