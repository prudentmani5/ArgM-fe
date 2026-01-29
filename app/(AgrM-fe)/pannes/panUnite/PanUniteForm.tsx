'use client';

import { InputText } from "primereact/inputtext";
import { PanUnite } from "./PanUnite";

interface PanUniteProps {
    panUnite: PanUnite;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PanUniteForm: React.FC<PanUniteProps> = ({panUnite, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="designationUnite">Désignation Unité</label>
                    <InputText 
                        id="designationUnite" 
                        type="text" 
                        name="designationUnite" 
                        value={panUnite.designationUnite} 
                        onChange={handleChange} 
                        required
                    />
                </div>
            </div>
        </div>
    );
}

export default PanUniteForm;