'use client'

import React from "react";
import { Service } from "./service";
import { Department } from "./department";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface ServiceProps {
    service: Service;
    departments: Department[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDepartmentSelect: (e: DropdownChangeEvent) => void;
}

const ServiceForm: React.FC<ServiceProps> = ({ 
    service, 
    departments,
    handleChange,
    handleDepartmentSelect
}) => {
    
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="DepartementId">Département*</label>
                    <Dropdown 
                        id="DepartementId" 
                        name="DepartementId" 
                        value={service.DepartementId} 
                        options={departments} 
                        optionLabel="Libelle" 
                        optionValue="DepartementId"
                        onChange={handleDepartmentSelect} 
                        placeholder="Sélectionner un département"
                        required
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="Libelle">Libellé*</label>
                    <InputText 
                        id="Libelle" 
                        name="Libelle" 
                        value={service.Libelle} 
                        onChange={handleChange} 
                        required 
                        maxLength={120}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="Responsable">Responsable</label>
                    <InputText 
                        id="Responsable" 
                        name="Responsable" 
                        value={service.Responsable || ''} 
                        onChange={handleChange} 
                        maxLength={30}
                    />
                </div>
            </div>
        </div>
    );
}

export default ServiceForm;