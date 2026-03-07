'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function RemboursementLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_VIEW', 'REMBOURSEMENT_CREATE', 'REMBOURSEMENT_UPDATE', 'REMBOURSEMENT_DELETE', 'REMBOURSEMENT_VALIDATE', 'REMBOURSEMENT_RECOVERY', 'REMBOURSEMENT_RESTRUCTURE', 'REMBOURSEMENT_REPORT', 'REMBOURSEMENT_SETTINGS', 'REMBOURSEMENT_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
