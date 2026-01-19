// ClasseMarchandiseForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { ClasseMarchandise } from "./ClasseMarchandise";

interface ClasseMarchandiseProps {
    classeMarchandise: ClasseMarchandise;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClasseMarchandiseForm: React.FC<ClasseMarchandiseProps> = ({ 
    classeMarchandise,
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={classeMarchandise.libelle}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="compteImp">Compte Import</label>
                    <InputText
                        id="compteImp"
                        name="compteImp"
                        value={classeMarchandise.compteImp}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="compteExp">Compte Export</label>
                    <InputText
                        id="compteExp"
                        name="compteExp"
                        value={classeMarchandise.compteExp}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClasseMarchandiseForm;