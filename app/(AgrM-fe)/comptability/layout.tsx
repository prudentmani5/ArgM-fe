'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function ComptabilityLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE', 'ACCOUNTING_ENTRY_VALIDATE', 'ACCOUNTING_DELETE', 'ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_SETTINGS', 'ACCOUNTING_REPORT_VIEW', 'ACCOUNTING_REPORT_EXPORT', 'ACCOUNTING_INTERNAL_ACCOUNTS']}>
            {children}
        </ProtectedPage>
    );
}
