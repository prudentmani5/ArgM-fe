'use client'

import React from "react";
import { Categorie } from "./categorie";
import { InputText } from "primereact/inputtext";

interface CategorieProps {
    categorie: Categorie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategorieForm: React.FC<CategorieProps> = ({ 
    categorie, 
    handleChange
}) => {
    
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* <div className="field col-6">
                    <label htmlFor="CategorieId">Catégorie ID*</label>
                    <InputText 
                        id="CategorieId" 
                        name="CategorieId" 
                        value={categorie.CategorieId} 
                        onChange={handleChange} 
                        required 
                        maxLength={3}
                    />
                </div> */}
                <div className="field col-6">
                    <label htmlFor="Libelle">Libellé*</label>
                    <InputText 
                        id="Libelle" 
                        name="Libelle" 
                        value={categorie.Libelle} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
            </div>
        </div>
    );
}

export default CategorieForm;