// TypePackagingForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { TypePackaging } from "./TypePackaging";

interface TypePackagingProps {
    typePackaging: TypePackaging;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const TypePackagingForm: React.FC<TypePackagingProps> = ({ 
    typePackaging,
    handleChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="typeConditionId">ID Type Conditionnement</label>
                    <InputText
                        id="typeConditionId"
                        name="typeConditionId"
                        value={typePackaging.typeConditionId}
                        onChange={handleChange}
                        placeholder="Entrez l'ID du type"
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={typePackaging.libelle}
                        onChange={handleChange}
                        placeholder="Entrez le libellé"
                    />
                </div>
                <div className="field col-12">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="fraisPompage"
                            name="fraisPompage"
                            checked={typePackaging.fraisPompage}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="fraisPompage" className="ml-2">
                            Frais de Pompage
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypePackagingForm;