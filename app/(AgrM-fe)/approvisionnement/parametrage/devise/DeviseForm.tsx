// DeviseForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Devise } from "./Devise";

interface DeviseProps {
    devise: Devise;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: keyof Devise, value: number | null) => void;
}

const DeviseForm: React.FC<DeviseProps> = ({ 
    devise, 
    handleChange,
    handleNumberChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="deviseId">ID Devise</label>
                    <InputText 
                        id="deviseId" 
                        type="text" 
                        name="deviseId" 
                        value={devise.deviseId} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="LibelleDevise">Libellé Devise</label>
                    <InputText 
                        id="LibelleDevise" 
                        type="text" 
                        name="LibelleDevise" 
                        value={devise.LibelleDevise} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="Symbole">Symbole</label>
                    <InputText 
                        id="Symbole" 
                        type="text" 
                        name="Symbole" 
                        value={devise.Symbole} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="TauxChange">Taux de Change</label>
                    <InputNumber 
                        id="TauxChange" 
                        name="TauxChange" 
                        value={devise.TauxChange} 
                        onValueChange={(e) => handleNumberChange('TauxChange', e.value === undefined ? null : e.value)} 
                        mode="decimal" 
                        minFractionDigits={2}
                        maxFractionDigits={4}
                    />
                </div>
            </div>
        </div>
    );
}

export default DeviseForm;