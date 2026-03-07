'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CreditReferenceDataLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
