'use client';

import { InputText } from "primereact/inputtext";
import { StkUnite } from "./StkUnite";

interface StkUniteProps {
    stkUnite: StkUnite;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const StkUniteForm: React.FC<StkUniteProps> = ({stkUnite, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="uniteId">ID Unité</label>
                    <InputText id="uniteId" type="text" name="uniteId" value={stkUnite.uniteId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={stkUnite.libelle} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default StkUniteForm;