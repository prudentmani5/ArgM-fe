// MagasinForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Magasin } from "./Magasin";

interface MagasinProps {
    magasin: Magasin;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (name: keyof Magasin, checked: boolean) => void;
    handleNumberChange: (name: keyof Magasin, value: number | null) => void;
}

const MagasinForm: React.FC<MagasinProps> = ({ 
    magasin, 
    handleChange, 
    handleCheckboxChange,
    handleNumberChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="magasinId">ID Magasin</label>
                    <InputText 
                        id="magasinId" 
                        type="text" 
                        name="magasinId" 
                        value={magasin.magasinId} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText 
                        id="nom" 
                        type="text" 
                        name="nom" 
                        value={magasin.nom} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText 
                        id="adresse" 
                        type="text" 
                        name="adresse" 
                        value={magasin.adresse} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="type">Type</label>
                    <InputNumber 
                        id="type" 
                        name="type" 
                        value={magasin.type} 
                        onValueChange={(e) => handleNumberChange('type', e.value ?? null)} 
                        mode="decimal" 
                        showButtons 
                        min={0} 
                    />
                </div>
                <div className="field col-6 flex align-items-center gap-2">
                    <Checkbox 
                        inputId="pointVente" 
                        name="pointVente" 
                        checked={magasin.pointVente} 
                        onChange={(e) => handleCheckboxChange('pointVente', e.checked ?? false)} 
                    />
                    <label htmlFor="pointVente">Point de vente</label>
                </div>
            </div>
        </div>
    );
}

export default MagasinForm;