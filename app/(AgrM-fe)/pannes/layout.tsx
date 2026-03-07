'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function PannesLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RH_MANAGER', 'RH_OPERATEUR_SAISIE']}>
            {children}
        </ProtectedPage>
    );
}
