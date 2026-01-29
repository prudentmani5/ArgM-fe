'use client';

import { InputText } from 'primereact/inputtext';
import { AppSettings } from '../../../../types/kukazeeSettings';


interface AppSettingsComponentProps {
    appSettings: AppSettings,
}

const AppSettingsComponent: React.FC<AppSettingsComponentProps> = ({ appSettings }) => {

    return <>
        <div className="grid">
            <div className="col-12">
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="companyName">Raison societe</label>
                            <InputText id="companyName" type="text" value={appSettings?.companyName} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="companyCountry">Pays</label>
                            <InputText id="companyCountry" type="text" value={appSettings?.companyCountry} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="companyProvince">Province</label>
                            <InputText id="companyProvince" type="text" value={appSettings?.companyProvince} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};

export default AppSettingsComponent;
;
