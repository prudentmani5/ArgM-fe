// EmballageForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Emballage } from "./Emballage";

interface EmballageProps {
    emballage: Emballage;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmballageForm: React.FC<EmballageProps> = ({ 
    emballage,
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="nom">Libéllé du type d'emballage</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={emballage.nom}
                        onChange={handleChange}
                        placeholder="Entrez le libéllé du type de l'emballage"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmballageForm;