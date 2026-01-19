// ClasseCategoryForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { ClasseCategory } from "./ClasseCategory";

interface ClasseCategoryProps {
    classeCategory: ClasseCategory;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClasseCategoryForm: React.FC<ClasseCategoryProps> = ({ 
    classeCategory,
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="categorieId">ID Catégorie</label>
                    <InputText
                        id="categorieId"
                        name="categorieId"
                        value={classeCategory.categorieId}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={classeCategory.libelle}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClasseCategoryForm;