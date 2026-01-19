// StkFraisForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { StkFrais } from "./StkFrais";

interface StkFraisProps {
    frais: StkFrais;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StkFraisForm: React.FC<StkFraisProps> = ({ 
    frais, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="FraisId">ID Frais</label>
                    <InputText 
                        id="FraisId" 
                        type="text" 
                        name="FraisId" 
                        value={frais.FraisId} 
                        onChange={handleChange} 
                        readOnly={true}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="libelle" 
                        value={frais.libelle} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default StkFraisForm;