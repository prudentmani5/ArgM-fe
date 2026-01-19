'use client';

import { InputText } from 'primereact/inputtext';
import { BillingSettings } from '../../../../types/kukazeeSettings';

interface BillingSettingsComponentProps {
    billingSettings: BillingSettings;
}


const BillingSettingsComponent: React.FC<BillingSettingsComponentProps> = ({ billingSettings }) => {

    return <>
        <div className="grid">
            <div className="col-12">
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="field md:col-6">
                            <label htmlFor="defaultCustomerName">Libelle client par defaut</label>
                            <InputText id="defaultCustomerName" type="text"
                                       value={billingSettings?.defaultCustomerName} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};

export default BillingSettingsComponent;