'use client';

import { InputText } from "primereact/inputtext";
import { Caissier } from "./Caissier";

interface CaissierProps {
    caissier: Caissier;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const CaissierForm: React.FC<CaissierProps> = ({caissier, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="nomPrenom">Nom & Prénom</label>
                    <InputText 
                        id="nomPrenom" 
                        type="text" 
                        name="nomPrenom" 
                        value={caissier.nomPrenom} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="fonction">Fonction</label>
                    <InputText 
                        id="fonction" 
                        type="text" 
                        name="fonction" 
                        value={caissier.fonction} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default CaissierForm;