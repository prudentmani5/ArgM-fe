'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function CustomerGroupReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
