'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CustomerGroupReferenceDataLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
