'use client';
import { ProtectedPage } from '../../../../components/ProtectedPage';

export default function RelevesLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_CREATE']}>
            {children}
        </ProtectedPage>
    );
}
