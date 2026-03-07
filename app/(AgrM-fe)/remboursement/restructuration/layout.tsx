'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RestructurationLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_RESTRUCTURE']}>
            {children}
        </ProtectedPage>
    );
}
