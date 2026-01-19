'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

/**
 * Root Page - Automatic Redirect Handler
 * ========================================
 * When users visit http://localhost:3000/ or http://localhost:3000
 * This page automatically redirects them to:
 * - /auth/login2 if they're not authenticated
 * - /settings/bienvenue if they're already logged in
 */
function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        const token = Cookies.get('token');
        const appUser = Cookies.get('appUser');

        if (token && appUser) {
            // User is logged in, redirect to dashboard/welcome page
            router.replace('/settings/bienvenue');
        } else {
            // User is not logged in, redirect to login page
            router.replace('/auth/login2');
        }
    }, [router]);

    // Show nothing while redirecting
    return (
        <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
    );
}

export default RootPage;
