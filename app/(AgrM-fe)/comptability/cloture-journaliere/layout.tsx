'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function ComptabilityClotureLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
