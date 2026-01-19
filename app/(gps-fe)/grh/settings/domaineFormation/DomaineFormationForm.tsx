'use client';

import { InputText } from "primereact/inputtext";
import { DomaineFormation } from "./DomaineFormaton";

interface Props {
    domaine: DomaineFormation;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DomaineFormationForm: React.FC<Props> = ({ domaine, handleChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="domaineId">Code</label>
                    <InputText id="domaineId" type="text" name="domaineId" value={domaine.domaineId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={domaine.libelle} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default DomaineFormationForm;
