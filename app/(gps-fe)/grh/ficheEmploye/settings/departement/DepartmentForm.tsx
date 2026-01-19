'use client'

import React from "react";
import { Department } from "./Department";
import { InputText } from "primereact/inputtext";

interface DepartmentFormProps {
    department: Department;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing?: boolean;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ 
    department, 
    handleChange,
    isEditing = false
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="departementId">ID Département *</label>
                    <InputText 
                        id="departementId" 
                        type="text" 
                        name="DepartementId" 
                        value={department.DepartementId} 
                        onChange={handleChange}
                        maxLength={3}
                        placeholder="Ex: INF, RH, FIN..."
                        disabled={isEditing} // ID should not be editable during update
                        required
                    />
                    <small className="text-muted">Maximum 3 caractères</small>
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé *</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="Libelle" 
                        value={department.Libelle} 
                        onChange={handleChange}
                        maxLength={50}
                        placeholder="Ex: Informatique, Ressources Humaines..."
                        required
                    />
                    <small className="text-muted">Maximum 50 caractères</small>
                </div>
            </div>
        </div>
    );
};

export default DepartmentForm;