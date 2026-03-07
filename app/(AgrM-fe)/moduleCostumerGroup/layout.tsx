'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function CustomerGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_VIEW', 'CUSTOMER_GROUP_CREATE', 'CUSTOMER_GROUP_UPDATE', 'CUSTOMER_GROUP_DELETE', 'CUSTOMER_GROUP_APPROVE', 'CUSTOMER_GROUP_BLACKLIST', 'CUSTOMER_GROUP_REPORT', 'CUSTOMER_GROUP_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
