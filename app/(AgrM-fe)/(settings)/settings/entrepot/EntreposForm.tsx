'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Entrepos } from "./Entrepos";

interface EntreposProps {
    entrepos: Entrepos;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
}

const EntreposForm: React.FC<EntreposProps> = ({entrepos, handleChange, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="nom">Nom</label>
                    <InputText 
                        id="nom" 
                        name="nom" 
                        value={entrepos.nom} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12">
                    <label htmlFor="nbrePaletteTotal">Nombre total de palettes</label>
                    <InputNumber 
                        id="nbrePaletteTotal" 
                        name="nbrePaletteTotal" 
                        value={entrepos.nbrePaletteTotal} 
                        onValueChange={(e) => handleNumberChange("nbrePaletteTotal", e.value??null)} 
                        mode="decimal" 
                        min={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default EntreposForm;