'use client';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function EpargneClotureLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_DAILY_CLOSING']}>
            {children}
        </ProtectedPage>
    );
}
