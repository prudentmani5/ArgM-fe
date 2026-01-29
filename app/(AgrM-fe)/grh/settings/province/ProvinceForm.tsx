'use client';

import { InputText } from "primereact/inputtext";
import { Province } from "./Province";

interface ProvinceProps {
    province: Province;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ProvinceForm: React.FC<ProvinceProps> = ({province, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="provinceId">Code</label>
                <InputText 
                    id="provinceId" 
                    type="text" 
                    name="provinceId" 
                    value={province.provinceId} 
                    onChange={handleChange} 
                    maxLength={2}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="nom">Nom</label>
                <InputText 
                    id="nom" 
                    type="text" 
                    name="nom" 
                    value={province.nom} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
        </div>
    </div>
);
}

export default ProvinceForm;