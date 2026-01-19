'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { GrhPoste } from "./GrhPoste";
import { RHFonction } from "../rhfonction/RHFonction";

interface GrhPosteProps {
    grhposte: GrhPoste;
    rhfonctions: RHFonction[];
    selectedFonction: RHFonction | undefined;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: InputNumberValueChangeEvent) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
}

const GrhPosteForm: React.FC<GrhPosteProps> = ({
    grhposte, 
    rhfonctions, 
    selectedFonction, 
    handleChange, 
    handleValueChange, 
    handleDropDownSelect
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="posteId">Code</label>
                    <InputText 
                        id="posteId" 
                        type="text" 
                        name="posteId" 
                        value={grhposte.posteId} 
                        onChange={handleChange} 
                        maxLength={3}
                        placeholder="Ex: P01"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="fonctionId">Fonction</label>
                    <Dropdown 
                        name="fonctionId" 
                        value={grhposte.fonctionId} 
                        options={rhfonctions} 
                        optionLabel="libelle" 
                        optionValue="fonctionid" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la fonction"
                        filter
                        showClear
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nbrePoste">Nombre de Postes</label>
                    <InputNumber 
                        id="nbrePoste" 
                        name="nbrePoste" 
                        value={grhposte.nbrePoste} 
                        onValueChange={handleValueChange} 
                        min={0}
                        placeholder="Nombre total de postes"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nbrePosteVacant">Nombre de Postes Vacants</label>
                    <InputNumber 
                        id="nbrePosteVacant" 
                        name="nbrePosteVacant" 
                        value={grhposte.nbrePosteVacant} 
                        onValueChange={handleValueChange} 
                        min={0}
                        max={grhposte.nbrePoste}
                        placeholder="Nombre de postes vacants"
                    />
                </div>
            </div>
        </div>
    );
}

export default GrhPosteForm;