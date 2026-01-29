'use client';

import { InputText } from "primereact/inputtext";
import { EnginsCategorie } from "./EnginsCategorie";

interface EnginsCategorieProps {
    enginsCategorie: EnginsCategorie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EnginsCategorieForm: React.FC<EnginsCategorieProps> = ({enginsCategorie, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="categorieDesignation">Désignation Catégorie</label>
                    <InputText 
                        id="categorieDesignation" 
                        type="text" 
                        name="categorieDesignation" 
                        value={enginsCategorie.categorieDesignation} 
                        onChange={handleChange} 
                        required
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}

export default EnginsCategorieForm;