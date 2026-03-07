'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function PendingApprovalsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['USER_APPROVE']}>
            {children}
        </ProtectedPage>
    );
}
