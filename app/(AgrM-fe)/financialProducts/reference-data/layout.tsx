'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function FinancialProductsReferenceDataLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['FINANCIAL_PRODUCT_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
