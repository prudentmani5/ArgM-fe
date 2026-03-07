'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RapprochementRapportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
