'use client';

import { InputText } from "primereact/inputtext";
import { Categorie } from "./Categorie";

interface CategorieProps {
    categorie: Categorie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const CategorieForm: React.FC<CategorieProps> = ({categorie, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="categorieId">ID Catégorie</label>
                <InputText 
                    id="categorieId" 
                    type="text" 
                    name="categorieId" 
                    value={categorie.categorieId} 
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
                    value={categorie.libelle} 
                    onChange={handleChange} 
                    maxLength={50}
                />
            </div>
        </div>
    </div>
);
}

export default CategorieForm;