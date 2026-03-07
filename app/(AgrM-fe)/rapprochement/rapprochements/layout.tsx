'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RapprochmentsListLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_RECONCILE']}>
            {children}
        </ProtectedPage>
    );
}
