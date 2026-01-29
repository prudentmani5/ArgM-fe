'use client';

import { InputText } from "primereact/inputtext";
import { Department } from "./Department";

interface DepartmentProps {
    department: Department;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const DepartmentForm: React.FC<DepartmentProps> = ({department, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="departmentId">Code</label>
                <InputText 
                    id="departmentId" 
                    type="text" 
                    name="departmentId" 
                    value={department.departmentId} 
                    onChange={handleChange} 
                    maxLength={3}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="libelle">Libellé</label>
                <InputText 
                    id="libelle" 
                    type="text" 
                    name="libelle" 
                    value={department.libelle} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
        </div>
    </div>
);
}

export default DepartmentForm;