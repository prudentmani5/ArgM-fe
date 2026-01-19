import { usePathname, useSearchParams } from 'next/navigation';
import { ObjectUtils } from 'primereact/utils';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from './context/layoutcontext';
import type { Breadcrumb } from '../types/types';
import { Button } from 'primereact/button';
import Link from 'next/link';

const AppBreadcrumb = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [breadcrumb, setBreadcrumb] = useState<Breadcrumb | null>(null);
    const { breadcrumbs } = useContext(LayoutContext);

    useEffect(() => {
        const filteredBreadcrumbs = breadcrumbs?.find((crumb) => {
            return crumb.to?.replace(/\/$/, ' ') === pathname.replace(/\/$/, '');
        });
        setBreadcrumb(filteredBreadcrumbs ?? null);
    }, [pathname, breadcrumbs]);

    return (
        <div className="layout-breadcrumb-container">
            <nav className="layout-breadcrumb">
                <ol>
                    <li>
                        <Link href={'/'} style={{ color: 'inherit' }}>
                            <i className="pi pi-home"></i>
                        </Link>
                    </li>
                    {ObjectUtils.isNotEmpty(breadcrumb?.labels)
                        ? breadcrumb?.labels?.map((label, index) => {
                              return (
                                  <React.Fragment key={index}>
                                      <i className="pi pi-angle-right"></i>
                                      <li key={index}>{label}</li>
                                  </React.Fragment>
                              );
                          })
                        : pathname + searchParams.toString() === '/' && (
                              <>
                                  <i className="pi pi-angle-right"></i>
                                  <li key={'home'}>Sales Dashboard</li>
                              </>
                          )}
                </ol>
            </nav>
            <div className="layout-breadcrumb-buttons">
                <Button icon="pi pi-cloud-upload" rounded text className="p-button-plain"></Button>
                <Button icon="pi pi-bookmark" rounded text className="p-button-plain"></Button>
                <Button icon="pi pi-power-off" rounded text className="p-button-plain"></Button>
            </div>
        </div>
    );
};

export default AppBreadcrumb;
