'use client'

import React from "react";
import { CategoryArticle } from "./CategoryArticle";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Magasin } from "./Magasin";

interface CategoryArticleProps {
    category: CategoryArticle;
    magasins: Magasin[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
}

const CategoryArticleForm: React.FC<CategoryArticleProps> = ({ 
    category, 
    magasins, 
    handleChange, 
    handleDropDownSelect 
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                 <div className="field col-6">
                    <label htmlFor="id">Code categorie</label>
                    <InputText id="id" name="id" value={category.id} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" name="libelle" value={category.libelle} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="compte">Compte</label>
                    <InputText id="compte" name="compte" value={category.compte} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="type">Type</label>
                    <InputText id="type" name="type" value={category.type} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown 
                        id="magasinId" 
                        name="magasinId" 
                        value={category.magasinId} 
                        options={magasins} 
                        optionLabel="nom"  // Changé de "libelle" à "nom"
                        optionValue="magasinId" // Changé de "id" à "magasinId"
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner un magasin"
                        filter
                        showClear
                    />
                </div>
            </div>
        </div>
    );
}

export default CategoryArticleForm;