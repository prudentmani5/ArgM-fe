'use client';

import { InputText } from "primereact/inputtext";
import { RHFonction } from "./RHFonction";

interface RHFonctionProps {
    rhfonction: RHFonction;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const RHFonctionForm: React.FC<RHFonctionProps> = ({rhfonction, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="fonctionid">Code</label>
                <InputText 
                    id="fonctionid" 
                    type="text" 
                    name="fonctionid" 
                    value={rhfonction.fonctionid} 
                    onChange={handleChange} 
                    maxLength={2}
                    placeholder="Ex: 01"
                />
            </div>
            <div className="field col-6">
                <label htmlFor="libelle">Libellé</label>
                <InputText 
                    id="libelle" 
                    type="text" 
                    name="libelle" 
                    value={rhfonction.libelle} 
                    onChange={handleChange} 
                    maxLength={200}
                    placeholder="Libellé de la fonction"
                />
            </div>
        </div>
    </div>
);

}

export default RHFonctionForm;