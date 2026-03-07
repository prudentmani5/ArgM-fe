'use client';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function EpargneReferenceDataLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_SETTINGS']}>
            {children}
        </ProtectedPage>
    );
}
