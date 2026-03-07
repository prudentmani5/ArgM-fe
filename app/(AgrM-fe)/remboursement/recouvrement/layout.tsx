'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RecouvrementLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_RECOVERY']}>
            {children}
        </ProtectedPage>
    );
}
