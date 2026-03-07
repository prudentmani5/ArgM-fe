'use client';
import { ProtectedPage } from '../../../components/ProtectedPage';

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredAuthorities={['TRACKING_VIEW', 'TRACKING_CLEANUP']}>
            {children}
        </ProtectedPage>
    );
}
