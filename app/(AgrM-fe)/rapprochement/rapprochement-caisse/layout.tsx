'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RapprochementCaisseLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            {children}
        </ProtectedPage>
    );
}
