'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CreditRapportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
