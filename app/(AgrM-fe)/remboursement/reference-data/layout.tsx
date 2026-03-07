'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RemboursementReferenceDataLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
