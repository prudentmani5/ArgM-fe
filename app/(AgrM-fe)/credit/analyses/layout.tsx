'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CreditAnalysesLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_ANALYZE']}>
            {children}
        </ProtectedPage>
    );
}
