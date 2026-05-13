'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Grade } from "./Grade";

interface GradeProps {
    grade: Grade;
    categories: any[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: any) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
}

const GradeForm: React.FC<GradeProps> = ({grade, categories, handleChange, handleNumberChange, handleDropdownChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="gradeId">Code Grade *</label>
                <InputText 
                    id="gradeId" 
                    type="text" 
                    name="gradeId" 
                    value={grade.gradeId} 
                    onChange={handleChange} 
                    maxLength={5}
                    required
                />
            </div>
            <div className="field col-6">
                <label htmlFor="libelle">Libellé *</label>
                <InputText 
                    id="libelle" 
                    type="text" 
                    name="libelle" 
                    value={grade.libelle} 
                    onChange={handleChange} 
                    maxLength={50}
                    required
                />
            </div>
            <div className="field col-6">
                <label htmlFor="categorieId">Catégorie</label>
                <Dropdown
                    id="categorieId"
                    name="categorieId"
                    value={grade.categorieId}
                    options={categories}
                    onChange={handleDropdownChange}
                    optionLabel="libelle"
                    optionValue="categorieId"
                    placeholder="Sélectionner une catégorie"
                    filter
                    showClear
                />
            </div>
            <div className="field col-6">
                <label htmlFor="valeurIndice">Valeur Indice *</label>
                <InputNumber 
                    id="valeurIndice" 
                    value={grade.valeurIndice} 
                    onValueChange={handleNumberChange} 
                    useGrouping={false}
                    min={0}
                    placeholder="0"
                    required
                />
            </div>
        </div>
    </div>
);
}

export default GradeForm;