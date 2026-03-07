'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function RapprochementLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW', 'RAPPROCHEMENT_CREATE', 'RAPPROCHEMENT_UPDATE', 'RAPPROCHEMENT_DELETE', 'RAPPROCHEMENT_VALIDATE', 'RAPPROCHEMENT_APPROVE', 'RAPPROCHEMENT_RECONCILE', 'RAPPROCHEMENT_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
