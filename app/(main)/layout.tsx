import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'MicroCore ProFinance',
    description: 'Professional Financial Management Information System - Agrinova Microfinance.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'MicroCore ProFinance - Agrinova Microfinance',
        description: 'Professional Financial Management Information System - Agrinova Microfinance.',
    },
    icons: {
        icon: '/layout/images/logo/picture_navigateur.PNG'
    }
};

export default function MainLayout({ children }: MainLayoutProps) {
    return <Layout>{children}</Layout>;
}
