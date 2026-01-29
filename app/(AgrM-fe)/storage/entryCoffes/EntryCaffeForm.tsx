// EntryCaffeForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { EntryCaffe } from "./EntryCaffe";

interface EntryCaffeProps {
    entryCaffe: EntryCaffe;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
}

const EntryCaffeForm: React.FC<EntryCaffeProps> = ({ 
    entryCaffe,
    handleChange,
    handleNumberChange,
    handleDateChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Basic Information */}
                <div className="field col-6">
                    <label htmlFor="numeroOrdre">Numéro d'Ordre</label>
                    <InputText
                        id="numeroOrdre"
                        name="numeroOrdre"
                        value={entryCaffe.numeroOrdre}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={entryCaffe.dateEntree}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                {/* Vehicle Information */}
                <div className="field col-6">
                    <label htmlFor="plaqueEntre">Plaque</label>
                    <InputText
                        id="plaqueEntre"
                        name="plaqueEntre"
                        value={entryCaffe.plaqueEntre}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noLot">Numéro de Lot</label>
                    <InputText
                        id="noLot"
                        name="noLot"
                        value={entryCaffe.noLot}
                        onChange={handleChange}
                    />
                </div>

                {/* Quality Information */}
                <div className="field col-6">
                    <label htmlFor="qualite">Qualité</label>
                    <InputText
                        id="qualite"
                        name="qualite"
                        value={entryCaffe.qualite}
                        onChange={handleChange}
                    />
                </div>

                {/* Weight Information */}
                <div className="field col-4">
                    <label htmlFor="poidsBrut">Poids Brut (kg)</label>
                    <InputNumber
                        id="poidsBrut"
                        name="poidsBrut"
                        value={entryCaffe.poidsBrut}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="poidsNet">Poids Net (kg)</label>
                    <InputNumber
                        id="poidsNet"
                        name="poidsNet"
                        value={entryCaffe.poidsNet}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="nbreSac">Nombre de Sacs</label>
                    <InputNumber
                        id="nbreSac"
                        name="nbreSac"
                        value={entryCaffe.nbreSac}
                        onValueChange={handleNumberChange}
                        min={0}
                    />
                </div>

                {/* User Information */}
                <div className="field col-6">
                    <label htmlFor="userCreation">Utilisateur Création</label>
                    <InputText
                        id="userCreation"
                        name="userCreation"
                        value={entryCaffe.userCreation}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default EntryCaffeForm;