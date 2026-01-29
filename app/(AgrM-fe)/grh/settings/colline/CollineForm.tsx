'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Colline } from "./Colline";
import { Commune } from "../commune/Commune";

interface CollineProps {
    colline: Colline;
    communes: Commune[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropdownChange: (e: any) => void;
}

const CollineForm: React.FC<CollineProps> = ({colline, communes, handleChange, handleDropdownChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-4">
                <label htmlFor="collineId">Code</label>
                <InputText 
                    id="collineId" 
                    type="text" 
                    name="collineId" 
                    value={colline.collineId} 
                    onChange={handleChange} 
                    maxLength={7}
                />
            </div>
            <div className="field col-4">
                <label htmlFor="nom">Nom</label>
                <InputText 
                    id="nom" 
                    type="text" 
                    name="nom" 
                    value={colline.nom} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
            <div className="field col-4">
                <label htmlFor="communeId">Commune</label>
                <Dropdown
                    id="communeId"
                    name="communeId"
                    value={colline.communeId}
                    options={communes}
                    onChange={handleDropdownChange}
                    optionLabel="nom"
                    optionValue="communeId"
                    placeholder="Sélectionner une commune"
                    filter
                    showClear
                />
            </div>
        </div>
    </div>
);
}

export default CollineForm;