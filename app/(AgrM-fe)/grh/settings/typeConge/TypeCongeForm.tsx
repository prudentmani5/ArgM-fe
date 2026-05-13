'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { TypeConge } from "./TypeConge";

interface TypeCongeProps {
    typeConge: TypeConge;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const TypeCongeForm: React.FC<TypeCongeProps> = ({typeConge, handleChange, handleCheckboxChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="typeCongeId">Code</label>
                <InputText
                    id="typeCongeId"
                    type="text"
                    name="typeCongeId"
                    value={typeConge.typeCongeId}
                    onChange={handleChange}
                    maxLength={2}
                />
            </div>
            <div className="field col-6">
                <label htmlFor="libelle">Libellé</label>
                <InputText
                    id="libelle"
                    type="text"
                    name="libelle"
                    value={typeConge.libelle}
                    onChange={handleChange}
                    maxLength={50}
                />
            </div>
            <div className="field col-6">
                <div className="flex align-items-center">
                    <Checkbox
                        inputId="circostance"
                        name="circostance"
                        checked={typeConge.circostance}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="circostance" className="ml-2">Circonstance</label>
                </div>
            </div>
            <div className="field col-6">
                <div className="flex align-items-center">
                    <Checkbox
                        inputId="congeLimitE"
                        name="congeLimitE"
                        checked={typeConge.congeLimitE}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="congeLimitE" className="ml-2">Congé Limité</label>
                </div>
            </div>
        </div>
    </div>
);
}

export default TypeCongeForm;