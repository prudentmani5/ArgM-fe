'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function ContentieuxLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_RECOVERY']}>
            {children}
        </ProtectedPage>
    );
}
