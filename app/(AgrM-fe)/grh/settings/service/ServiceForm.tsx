'use client';

import { InputText } from "primereact/inputtext";
import { Service } from "./Service";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Department } from "../department/Department";

interface ServiceProps {
    service: Service;
    departments: Department[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
}

const ServiceForm: React.FC<ServiceProps> = ({service, departments, handleChange, handleDropDownSelect}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="serviceId">Code</label>
                <InputText 
                    id="serviceId" 
                    type="text" 
                    name="serviceId" 
                    value={service.serviceId} 
                    onChange={handleChange} 
                    maxLength={6}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="departmentId">Département</label>
                <Dropdown 
                    name="departmentId" 
                    value={service.departmentId} 
                    options={departments} 
                    optionLabel="libelle" 
                    optionValue="departmentId" 
                    onChange={handleDropDownSelect} 
                    placeholder="Sélectionner le département"
                />
            </div>
            <div className="field col-12">
                <label htmlFor="libelle">Libellé</label>
                <InputText 
                    id="libelle" 
                    type="text" 
                    name="libelle" 
                    value={service.libelle} 
                    onChange={handleChange} 
                    maxLength={120}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="responsable">Responsable</label>
                <InputText 
                    id="responsable" 
                    type="text" 
                    name="responsable" 
                    value={service.responsable} 
                    onChange={handleChange} 
                    maxLength={30}
                />
            </div>
        </div>
    </div>
);
}

export default ServiceForm;