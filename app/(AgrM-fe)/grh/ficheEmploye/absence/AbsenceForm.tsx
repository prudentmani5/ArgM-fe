'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Absence } from "./Absence";

interface AbsenceFormProps {
    absence: Absence;
    employeeName: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (e: any) => void;
    handleCheckboxChange: (e: any) => void;
    handleCalendarChange: (e: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const AbsenceForm: React.FC<AbsenceFormProps> = ({ 
    absence, 
    employeeName,
    handleChange, 
    handleNumberChange,
    handleCheckboxChange,
    handleCalendarChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={absence.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        disabled={isEditMode}
                        className={searchLoading ? "p-inputtext-loading" : ""}
                    />
                </div>

                <div className="field col-12 md:col-8">
                    <label htmlFor="employeeName">Nom de l'employé</label>
                    <InputText 
                        id="employeeName" 
                        value={employeeName} 
                        readOnly
                        className="p-inputtext-readonly"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateDebut">Date Début *</label>
                    <Calendar 
                        id="dateDebut" 
                        name="dateDebut" 
                        value={absence.dateDebut ? new Date(absence.dateDebut.split('/').reverse().join('-')) : null}
                        onChange={handleCalendarChange} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrJours">Nombre de Jours *</label>
                    <InputNumber
                        id="nbrJours"
                        name="nbrJours"
                        value={absence.nbrJours}
                        onValueChange={handleNumberChange}
                        min={0}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateFin">Date Fin</label>
                    <InputText
                        id="dateFin"
                        name="dateFin"
                        value={absence.dateFin}
                        readOnly
                        className="p-inputtext-readonly"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="reference">Référence</label>
                    <InputText 
                        id="reference" 
                        name="reference" 
                        value={absence.reference} 
                        onChange={handleChange} 
                        maxLength={20}
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <div className="field-checkbox">
                        <Checkbox 
                            inputId="estJustifie" 
                            name="estJustifie"
                            checked={absence.estJustifie} 
                            onChange={handleCheckboxChange} 
                        />
                        <label htmlFor="estJustifie">Justifiée</label>
                    </div>
                </div>

                <div className="field col-12">
                    <label htmlFor="justification">Justification</label>
                    <InputTextarea 
                        id="justification" 
                        name="justification" 
                        value={absence.justification} 
                        onChange={handleChange} 
                        rows={3}
                        maxLength={255}
                    />
                </div>
            </div>
        </div>
    );
};

export default AbsenceForm;