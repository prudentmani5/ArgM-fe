import React, { useContext } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            {/* <img src="/layout/images/logo/gps_icon_.png" alt="" style={{ width: "80px", height: "80px" }} /> */}
            <div className="flex gap-2">
                <span className="text-sm">© 2025 BU.CO.TEC. All rights reserved.</span>
             </div>
        </div>
    );
};

export default AppFooter;
