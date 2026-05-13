'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Situation } from "./Situation";

interface Props {
    situation: Situation;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: any) => void;
}

const SituationForm: React.FC<Props> = ({ situation, handleChange, handleCheckboxChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="situationId">Code</label>
                    <InputText id="situationId" type="text" name="situationId" value={situation.situationId} onChange={handleChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={situation.libelle} onChange={handleChange} />
                </div>
                <div className="field col-4 flex align-items-center">
                    <Checkbox inputId="recuperable" name="recuperable" checked={situation.recuperable} onChange={handleCheckboxChange} />
                    <label htmlFor="recuperable" className="ml-2">Récupérable</label>
                </div>
            </div>
        </div>
    );
}

export default SituationForm;
