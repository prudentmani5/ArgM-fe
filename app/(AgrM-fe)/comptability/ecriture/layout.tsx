'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function EcritureLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_ENTRY_CREATE']}>
            {children}
        </ProtectedPage>
    );
}
