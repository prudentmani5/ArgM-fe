import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'GPS-ERP',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'GPS-ERP',
        url: 'https://www.primefaces.org/ultima-react',
        description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
        images: ['https://www.primefaces.org/static/social/ultima-react.png'],
        ttl: 604800
    },
    icons: {
        icon: '/favicon1.ico'
    }
};

export default function MainLayout({ children }: MainLayoutProps) {
    return <Layout>{children}</Layout>;
}
