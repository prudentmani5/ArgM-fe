'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CreditComiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_COMMITTEE']}>
            {children}
        </ProtectedPage>
    );
}
