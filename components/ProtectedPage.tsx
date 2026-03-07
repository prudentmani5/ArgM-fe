'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/fetchData/useCurrentUser';
import { hasAnyAuthority } from '../app/(AgrM-fe)/usermanagement/types';

interface ProtectedPageProps {
    requiredAuthorities: string[];
    children: React.ReactNode;
    fallbackMessage?: string;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({
    requiredAuthorities,
    children,
    fallbackMessage = "Vous n'avez pas les permissions nécessaires pour accéder à cette page."
}) => {
    const { user, loading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login2');
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center p-5">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    if (!user) return null;

    if (!hasAnyAuthority(user, requiredAuthorities)) {
        return (
            <div className="card">
                <div className="flex flex-column align-items-center p-5">
                    <i className="pi pi-lock" style={{ fontSize: '3rem', color: 'var(--red-500)' }}></i>
                    <h3 className="mt-3">{fallbackMessage}</h3>
                    <p className="text-color-secondary">
                        Contactez votre administrateur pour obtenir les droits d'accès.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
