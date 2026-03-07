'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function CreditLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_VIEW', 'CREDIT_CREATE', 'CREDIT_UPDATE', 'CREDIT_DELETE', 'CREDIT_ANALYZE', 'CREDIT_COMMITTEE', 'CREDIT_DISBURSE', 'CREDIT_REPORT', 'CREDIT_SETTINGS', 'CREDIT_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
