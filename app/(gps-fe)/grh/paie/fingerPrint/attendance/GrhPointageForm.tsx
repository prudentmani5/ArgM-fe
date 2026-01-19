'use client'

import React from "react";
import { GrhPointage } from "./GrhPointage";
import { InputText } from "primereact/inputtext";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";

interface GrhPointageFormProps {
    pointage: GrhPointage;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCalendarChange: (e: CalendarChangeEvent) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    nomEmploye?: string;
    prenomEmploye?: string;
}

const GrhPointageForm: React.FC<GrhPointageFormProps> = ({ 
    pointage, 
    handleChange, 
    handleCalendarChange,
    handleNumberChange,
    handleCheckboxChange,
    handleMatriculeBlur,
    isEditMode = false,
    nomEmploye = "",
    prenomEmploye = ""
}) => {
    
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={pointage.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        disabled={isEditMode}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nomEmploye">Nom</label>
                    <InputText 
                        id="nomEmploye" 
                        name="nomEmploye" 
                        value={nomEmploye} 
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="prenomEmploye">Prénom</label>
                    <InputText 
                        id="prenomEmploye" 
                        name="prenomEmploye" 
                        value={prenomEmploye} 
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="datePointage">Date Pointage *</label>
                    <Calendar 
                        id="datePointage" 
                        name="datePointage" 
                        value={pointage.datePointage} 
                        onChange={handleCalendarChange} 
                        dateFormat="dd/mm/yy"
                        showIcon
                        required
                        hourFormat="24"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heureEntree">Heure Entrée</label>
                    <Calendar 
                        id="heureEntree" 
                        name="heureEntree" 
                        value={pointage.heureEntree} 
                        onChange={handleCalendarChange} 
                        timeOnly
                        hourFormat="24"
                        showIcon
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heureSortie">Heure Sortie</label>
                    <Calendar 
                        id="heureSortie" 
                        name="heureSortie" 
                        value={pointage.heureSortie} 
                        onChange={handleCalendarChange} 
                        timeOnly
                        hourFormat="24"
                        showIcon
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heureEntree2">Heure Entrée 2</label>
                    <Calendar 
                        id="heureEntree2" 
                        name="heureEntree2" 
                        value={pointage.heureEntree2} 
                        onChange={handleCalendarChange} 
                        timeOnly
                        hourFormat="24"
                        showIcon
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heureSortie2">Heure Sortie 2</label>
                    <Calendar 
                        id="heureSortie2" 
                        name="heureSortie2" 
                        value={pointage.heureSortie2} 
                        onChange={handleCalendarChange} 
                        timeOnly
                        hourFormat="24"
                        showIcon
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="typePointage">Type Pointage</label>
                    <InputText 
                        id="typePointage" 
                        name="typePointage" 
                        value={pointage.typePointage} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="statutPointage">Statut Pointage</label>
                    <InputText 
                        id="statutPointage" 
                        name="statutPointage" 
                        value={pointage.statutPointage} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exception">Exception</label>
                    <InputText 
                        id="exception" 
                        name="exception" 
                        value={pointage.exception} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heuresTravaillees">Heures Travaillées</label>
                    <InputNumber 
                        id="heuresTravaillees" 
                        name="heuresTravaillees" 
                        value={pointage.heuresTravaillees} 
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heuresNormales">Heures Normales</label>
                    <InputNumber 
                        id="heuresNormales" 
                        name="heuresNormales" 
                        value={pointage.heuresNormales} 
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="heuresSupplementaires">Heures Supplémentaires</label>
                    <InputNumber 
                        id="heuresSupplementaires" 
                        name="heuresSupplementaires" 
                        value={pointage.heuresSupplementaires} 
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="valide">Validé</label>
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="valide" 
                            name="valide" 
                            checked={pointage.valide} 
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>

                <div className="field col-12">
                    <label htmlFor="remarque">Remarque</label>
                    <InputTextarea 
                        id="remarque" 
                        name="remarque" 
                        value={pointage.remarque} 
                        onChange={handleChange}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

export default GrhPointageForm;
