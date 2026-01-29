'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Commune } from "./Commune";
import { Province } from "../province/Province";

interface CommuneProps {
    commune: Commune;
    provinces: Province[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropdownChange: (e: any) => void;
}

const CommuneForm: React.FC<CommuneProps> = ({commune, provinces, handleChange, handleDropdownChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-4">
                <label htmlFor="communeId">Code</label>
                <InputText 
                    id="communeId" 
                    type="text" 
                    name="communeId" 
                    value={commune.communeId} 
                    onChange={handleChange} 
                    maxLength={4}
                />
            </div>
            <div className="field col-4">
                <label htmlFor="nom">Nom</label>
                <InputText 
                    id="nom" 
                    type="text" 
                    name="nom" 
                    value={commune.nom} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
            <div className="field col-4">
                <label htmlFor="provinceId">Province</label>
                <Dropdown
                    id="provinceId"
                    name="provinceId"
                    value={commune.provinceId}
                    options={provinces}
                    onChange={handleDropdownChange}
                    optionLabel="nom"
                    optionValue="provinceId"
                    placeholder="Sélectionner une province"
                    filter
                    showClear
                />
            </div>
        </div>
    </div>
);
}

export default CommuneForm;