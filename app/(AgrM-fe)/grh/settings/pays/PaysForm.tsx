'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Pays } from "./Pays";

interface Props {
    pays: Pays;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: any) => void;
}

const PaysForm: React.FC<Props> = ({ pays, handleChange, handleCheckboxChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="paysId">Code</label>
                    <InputText id="paysId" type="text" name="paysId" value={pays.paysId} onChange={handleChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="nomPays">Nom du Pays</label>
                    <InputText id="nomPays" type="text" name="nomPays" value={pays.nomPays} onChange={handleChange} />
                </div>
                <div className="field col-4 flex align-items-center">
                    <Checkbox inputId="principal" name="principal" checked={pays.principal} onChange={handleCheckboxChange} />
                    <label htmlFor="principal" className="ml-2">Principal</label>
                </div>
            </div>
        </div>
    );
}

export default PaysForm;
