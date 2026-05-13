'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Conge } from "./Conge";
import { TypeConge } from "../../settings/typeConge/TypeConge";

interface CongeFormProps {
    conge: Conge;
    employeeName: string;
    typeConges: TypeConge[];
    selectedTypeConge: TypeConge | null;
    nbrJoursPrevu: number;
    dateDebut: Date | null;
    dateRetour: Date | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: any) => void;
    handleCalendarChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    handleExerciceChange?: (exercice: number) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const CongeForm: React.FC<CongeFormProps> = ({
    conge,
    employeeName,
    typeConges,
    selectedTypeConge,
    nbrJoursPrevu,
    dateDebut,
    dateRetour,
    handleChange,
    handleNumberChange,
    handleCalendarChange,
    handleDropDownSelect,
    handleMatriculeBlur,
    handleExerciceChange,
    isEditMode = false,
    searchLoading = false
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
                        value={conge.matriculeId} 
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
                        value={conge.exercice} 
                        onValueChange={handleExerciceNumberChange}
                        min={2000}
                        max={2099}
                        useGrouping={false}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeCongeId">Type de Congé *</label>
                    <Dropdown
                        name="typeCongeId"
                        value={conge.typeCongeId}
                        options={typeConges}
                        optionLabel="libelle"
                        optionValue="typeCongeId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner le type de congé"
                        required
                    />
                </div>

                {selectedTypeConge?.circostance && (
                    <div className="field col-12 md:col-4">
                        <label htmlFor="typeCircostance">Type de Circonstance</label>
                        <InputText
                            id="typeCircostance"
                            name="typeCircostance"
                            value={conge.typeCircostance}
                            onChange={handleChange}
                            placeholder="Précisez la circonstance"
                        />
                    </div>
                )}

                <div className="field col-12 md:col-2">
                    <label htmlFor="nbrJoursPrevu">Jours Prévus</label>
                    <InputNumber 
                        id="nbrJoursPrevu" 
                        value={nbrJoursPrevu} 
                        readOnly
                        className="p-inputnumber-readonly"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="nbrJoursDisponible">Jours Disponibles</label>
                    <InputNumber 
                        id="nbrJoursDisponible" 
                        name="nbrJoursDisponible"
                        value={conge.nbrJoursDisponible} 
                        readOnly
                        className="p-inputnumber-readonly"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateDebut">Date Début *</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={dateDebut}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateRetour">Date Retour *</label>
                    <Calendar
                        id="dateRetour"
                        name="dateRetour"
                        value={dateRetour}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrJoursSollicites">Jours Sollicités *</label>
                    <InputNumber 
                        id="nbrJoursSollicites" 
                        name="nbrJoursSollicites"
                        value={conge.nbrJoursSollicites} 
                        onValueChange={handleNumberChange}
                        min={0}
                        maxFractionDigits={1}
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrJoursAccordes">Jours Accordés *</label>
                    <InputNumber 
                        id="nbrJoursAccordes" 
                        name="nbrJoursAccordes"
                        value={conge.nbrJoursAccordes} 
                        onValueChange={handleNumberChange}
                        min={0}
                        maxFractionDigits={1}
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrJoursEffectifs">Jours Effectifs *</label>
                    <InputNumber 
                        id="nbrJoursEffectifs" 
                        name="nbrJoursEffectifs"
                        value={conge.nbrJoursEffectifs} 
                        onValueChange={handleNumberChange}
                        min={0}
                        maxFractionDigits={1}
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="cumuleCongeCirconstance">Cumul Congé Circonstance</label>
                    <InputNumber 
                        id="cumuleCongeCirconstance" 
                        name="cumuleCongeCirconstance"
                        value={conge.cumuleCongeCirconstance} 
                        onValueChange={handleNumberChange}
                        min={0}
                        maxFractionDigits={1}
                    />
                </div>
            </div>
        </div>
    );
};

export default CongeForm;