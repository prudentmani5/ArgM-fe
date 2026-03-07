'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RemboursementClotureLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
