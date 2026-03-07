'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CreditClotureLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
