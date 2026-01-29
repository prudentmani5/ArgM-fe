// StkDestinationForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { StkDestination } from "./StkDestination";

interface StkDestinationProps {
    destination: StkDestination;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StkDestinationForm: React.FC<StkDestinationProps> = ({ 
    destination, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="pDestinationId">ID Destination</label>
                    <InputText 
                        id="pDestinationId" 
                        type="text" 
                        name="pDestinationId" 
                        value={destination.pDestinationId} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="pLibelle">Libellé</label>
                    <InputText 
                        id="pLibelle" 
                        type="text" 
                        name="pLibelle" 
                        value={destination.pLibelle} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="pCompte">Compte</label>
                    <InputText 
                        id="pCompte" 
                        type="text" 
                        name="pCompte" 
                        value={destination.pCompte} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default StkDestinationForm;