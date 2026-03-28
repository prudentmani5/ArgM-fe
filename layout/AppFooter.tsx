import React, { useContext } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span className="text-sm">© 2026 INFOSTEAM. All rights reserved.</span>
        </div>
    );
};

export default AppFooter;
