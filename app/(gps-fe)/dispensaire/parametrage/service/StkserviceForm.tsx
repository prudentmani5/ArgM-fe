// StkserviceForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Stkservice } from "./Stkservice";

interface StkserviceProps {
    service: Stkservice;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StkserviceForm: React.FC<StkserviceProps> = ({ 
    service, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="serviceId">ID Service</label>
                    <InputText 
                        id="serviceId" 
                        type="text" 
                        name="serviceId" 
                        value={service.serviceId} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="libelle" 
                        value={service.libelle} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default StkserviceForm;