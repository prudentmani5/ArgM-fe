'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function FinancialProductsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['FINANCIAL_PRODUCT_VIEW', 'FINANCIAL_PRODUCT_CREATE', 'FINANCIAL_PRODUCT_UPDATE', 'FINANCIAL_PRODUCT_DELETE', 'FINANCIAL_PRODUCT_APPROVE', 'FINANCIAL_PRODUCT_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
