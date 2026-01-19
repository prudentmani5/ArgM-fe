// FacClasseForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { FacClasse } from "./FacClasse";

interface FacClasseProps {
    facClasse: FacClasse;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    categories: { label: string; value: string }[];
}

const FacClasseForm: React.FC<FacClasseProps> = ({ 
    facClasse,
    handleChange,
    handleNumberChange,
    handleDropdownChange,
    categories
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="codeClasse">Code Classe</label>
                    <InputText
                        id="codeClasse"
                        name="codeClasse"
                        value={facClasse.codeClasse}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="categorieId">Catégorie</label>
                    <Dropdown
                        id="categorieId"
                        name="categorieId"
                        value={facClasse.categorieId}
                        options={categories}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une catégorie"
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="prixCamion">Prix Camion</label>
                    <InputNumber
                        id="prixCamion"
                        name="prixCamion"
                        value={facClasse.prixCamion}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        min={0}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="prixBarge">Prix Barge</label>
                    <InputNumber
                        id="prixBarge"
                        name="prixBarge"
                        value={facClasse.prixBarge}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        min={0}
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="compte">Compte</label>
                    <InputText
                        id="compte"
                        name="compte"
                        value={facClasse.compte}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default FacClasseForm;