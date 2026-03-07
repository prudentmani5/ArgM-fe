'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RemboursementRapportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
