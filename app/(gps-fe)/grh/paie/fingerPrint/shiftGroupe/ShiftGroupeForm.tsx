'use client';

import { InputText } from "primereact/inputtext";
import { ShiftGroupe } from "./ShiftGroupe";

interface ShiftGroupeProps {
    shiftGroupe: ShiftGroupe;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ShiftGroupeForm: React.FC<ShiftGroupeProps> = ({shiftGroupe, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="groupeId">Code</label>
                <InputText 
                    id="groupeId" 
                    type="text" 
                    name="groupeId" 
                    value={shiftGroupe.groupeId} 
                    onChange={handleChange} 
                    maxLength={2}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="libelle">Libellé</label>
                <InputText 
                    id="libelle" 
                    type="text" 
                    name="libelle" 
                    value={shiftGroupe.libelle} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="heureDebut">Heure Début</label>
                <InputText 
                    id="heureDebut" 
                    type="text" 
                    name="heureDebut" 
                    value={shiftGroupe.heureDebut} 
                    onChange={handleChange} 
                    maxLength={50}
                    placeholder="Ex: 08:00"
                />
            </div>
            <div className="field col-6">
                <label htmlFor="heureFin">Heure Fin</label>
                <InputText 
                    id="heureFin" 
                    type="text" 
                    name="heureFin" 
                    value={shiftGroupe.heureFin} 
                    onChange={handleChange} 
                    maxLength={50}
                    placeholder="Ex: 17:00"
                />
            </div>
        </div>
    </div>
);
}

export default ShiftGroupeForm;