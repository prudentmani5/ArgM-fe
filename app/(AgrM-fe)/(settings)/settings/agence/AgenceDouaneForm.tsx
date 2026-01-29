'use client';

import { InputText } from "primereact/inputtext";
import { AgenceDouane } from "./AgenceDouane";

interface AgenceDouaneProps {
    agenceDouane: AgenceDouane;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AgenceDouaneForm: React.FC<AgenceDouaneProps> = ({agenceDouane, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={agenceDouane.libelle} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="responsable">Responsable</label>
                    <InputText id="responsable" type="text" name="responsable" value={agenceDouane.responsable} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText id="adresse" type="text" name="adresse" value={agenceDouane.adresse} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="tel">Tél</label>
                    <InputText id="tel" type="text" name="tel" value={agenceDouane.tel} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default AgenceDouaneForm;