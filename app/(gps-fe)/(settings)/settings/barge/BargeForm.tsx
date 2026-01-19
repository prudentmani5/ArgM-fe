'use client'

import React, { useState } from "react";
import { Barge } from "./Barge"
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberChangeEvent, InputNumberValueChangeEvent } from "primereact/inputnumber";
import BargeComponent from "./page";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { TransportType } from "./TransportType";
import { Armateur } from "../armateur/Armateur";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";


interface BargeProps {

    barge: Barge;
    armateurs: Armateur [];
    selectedArmateur: Armateur;
    transportOptions : TransportType[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: InputNumberValueChangeEvent) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleCheckboxChange?: (e: CheckboxChangeEvent) => void;
}

const BargeForm: React.FC<BargeProps> = ({ barge, selectedArmateur, armateurs, transportOptions, handleChange, handleValueChange, handleDropDownSelect, handleCheckboxChange }) => {

    const [selectedTransport, setSelectedTransport] = useState<string | null>(null);

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="nom">Nom</label>
                    <InputText id="nom" type="text" name="nom" value={barge.nom} onChange={handleChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="armateur">Armateur</label>
                   <Dropdown name="armateur" value={barge.armateur} options={armateurs} optionLabel="nom" optionValue="id" onChange={handleDropDownSelect} placeholder="Selectionner l'armateur"/>
                </div>
                  <div className="field col-4">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText id="plaque" type="text" name="plaque" value={barge.plaque} onChange={handleChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="longeur">Longueur</label>
                    <InputNumber id="longeur" type="text" name="longeur" value={barge.longeur} onValueChange={handleValueChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="largeur">Largeur</label>
                    <InputNumber id="largeur" type="text" name="largeur" value={barge.largeur} onValueChange={handleValueChange} />
                </div>
                <div className="field col-4">
                    <label htmlFor="transport">Transport</label>
                    <Dropdown value={barge.transport} name="transport"  options={transportOptions} optionLabel="label" optionValue="value" onChange={handleDropDownSelect} placeholder="Selectionner le type de transport"/>
                </div>
              
                <div className="field col-12 flex align-items-center">
                    <Checkbox
                        inputId="accostageEnDollars"
                        name="accostageEnDollars"
                        checked={barge.accostageEnDollars || false}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="accostageEnDollars" className="ml-2">Accostage en Dollars</label>
                </div>
            </div>
        </div>
    );

}

export default BargeForm;