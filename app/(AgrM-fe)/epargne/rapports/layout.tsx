'use client';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function EpargneRapportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_REPORT']}>
            {children}
        </ProtectedPage>
    );
}
