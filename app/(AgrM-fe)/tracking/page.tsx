'use client';

import TrackingPage from './TrackingPage';
import { ProtectedPage } from '@/components/ProtectedPage';

function PageContent() {
    return <TrackingPage />;
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['TRACKING_VIEW']}>
            <PageContent />
        </ProtectedPage>
    );
}
