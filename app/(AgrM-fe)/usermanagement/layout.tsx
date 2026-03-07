'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_APPROVE', 'USER_DISABLE', 'ROLE_MANAGE']}>
            {children}
        </ProtectedPage>
    );
}
