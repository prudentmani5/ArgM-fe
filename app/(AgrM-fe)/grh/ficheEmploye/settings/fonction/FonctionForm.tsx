'use client'

import React from "react";
import { Fonction } from "./fonction";
import { InputText } from "primereact/inputtext";

interface FonctionProps {
    fonction: Fonction;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FonctionForm: React.FC<FonctionProps> = ({ 
    fonction, 
    handleChange
}) => {
    
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* <div className="field col-6">
                    <label htmlFor="FonctionId">Fonction ID*</label>
                    <InputText 
                        id="FonctionId" 
                        name="FonctionId" 
                        value={fonction.FonctionId} 
                        onChange={handleChange} 
                        required 
                        maxLength={2}
                    />
                </div> */}
                <div className="field col-6">
                    <label htmlFor="Libelle">Libellé*</label>
                    <InputText 
                        id="Libelle" 
                        name="Libelle" 
                        value={fonction.Libelle} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="Description">Description</label>
                    <InputText 
                        id="Description" 
                        name="Description" 
                        value={fonction.Description || ''} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default FonctionForm;