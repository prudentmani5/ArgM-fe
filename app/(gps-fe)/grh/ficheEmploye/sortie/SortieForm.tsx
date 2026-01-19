'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Sortie } from "./Sortie";

interface SortieFormProps {
    sortie: Sortie;
    employeeName: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (e: any) => void;
    handleCalendarChange: (e: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    handleExerciceChange?: (exercice: number) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
    dateSortie:Date
}

const SortieForm: React.FC<SortieFormProps> = ({ 
    sortie, 
    employeeName,
    handleChange, 
    handleNumberChange,
    handleCalendarChange,
    handleMatriculeBlur,
    handleExerciceChange,
    isEditMode = false,
    searchLoading = false,
    dateSortie
}) => {

    const handleExerciceNumberChange = (e: any) => {
        const value = e.value;
        if (handleExerciceChange && value) {
            handleExerciceChange(value);
        }
        handleNumberChange(e);
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={sortie.matriculeId} 
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

                <div className="field col-12 md:col-6">
                    <label htmlFor="employeeName">Nom de l'employé</label>
                    <InputText 
                        id="employeeName" 
                        value={employeeName} 
                        readOnly
                        className="p-inputtext-readonly"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exercice">Exercice *</label>
                    <InputNumber 
                        id="exercice" 
                        name="exercice"
                        value={sortie.exercice} 
                        onValueChange={handleExerciceNumberChange}
                        min={2000}
                        max={2099}
                        useGrouping={false}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateSortie">Date de Sortie *</label>
                    <Calendar
                        id="dateSortie"
                        name="dateSortie"
                        value={dateSortie}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        showTime
                        hourFormat="24"
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrJours">Nombre de jours</label>
                    <InputNumber
                        id="nbrJours"
                        name="nbrJours"
                        value={sortie.nbrJours}
                        onValueChange={handleNumberChange}
                        min={0}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrHeures">Nombre d'Heures *</label>
                    <InputNumber
                        id="nbrHeures"
                        name="nbrHeures"
                        value={sortie.nbrHeures}
                        onValueChange={handleNumberChange}
                        min={0}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrMinute">Minutes</label>
                    <InputNumber
                        id="nbrMinute"
                        name="nbrMinute"
                        value={sortie.nbrMinute}
                        onValueChange={handleNumberChange}
                        min={0}
                        max={59}
                    />
                </div>

                <div className="field col-12">
                    <label htmlFor="justification">Justification</label>
                    <InputTextarea 
                        id="justification" 
                        name="justification" 
                        value={sortie.justification} 
                        onChange={handleChange} 
                        rows={3}
                        maxLength={255}
                        placeholder="Motif de la sortie..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SortieForm;