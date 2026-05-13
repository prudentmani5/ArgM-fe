'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { ActionDisciplinaire } from "./ActionDisciplinaire";

interface ActionDisciplinaireFormProps {
    action: ActionDisciplinaire;
    employeeName: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCalendarChange: (e: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const ActionDisciplinaireForm: React.FC<ActionDisciplinaireFormProps> = ({
    action,
    employeeName,
    handleChange,
    handleCalendarChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    const parseDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return null;
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText
                        id="matriculeId"
                        name="matriculeId"
                        value={action.matriculeId}
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
                    <label htmlFor="employeeName">Nom de l'employe</label>
                    <InputText
                        id="employeeName"
                        value={employeeName}
                        readOnly
                        className="p-inputtext-readonly"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateOuverture">Date Ouverture *</label>
                    <Calendar
                        id="dateOuverture"
                        name="dateOuverture"
                        value={parseDate(action.dateOuverture)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateReponse">Date Reponse</label>
                    <Calendar
                        id="dateReponse"
                        name="dateReponse"
                        value={parseDate(action.dateReponse)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateCloture">Date Cloture</label>
                    <Calendar
                        id="dateCloture"
                        name="dateCloture"
                        value={parseDate(action.dateCloture)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateDecision">Date Decision</label>
                    <Calendar
                        id="dateDecision"
                        name="dateDecision"
                        value={parseDate(action.dateDecision)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateLevee">Date Levee</label>
                    <Calendar
                        id="dateLevee"
                        name="dateLevee"
                        value={parseDate(action.dateLevee)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="decisionPrise">Decision Prise</label>
                    <InputText
                        id="decisionPrise"
                        name="decisionPrise"
                        value={action.decisionPrise}
                        onChange={handleChange}
                        maxLength={100}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="refDecision">Reference Decision</label>
                    <InputText
                        id="refDecision"
                        name="refDecision"
                        value={action.refDecision}
                        onChange={handleChange}
                        maxLength={30}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="autoriteDecision">Autorite Decision</label>
                    <InputText
                        id="autoriteDecision"
                        name="autoriteDecision"
                        value={action.autoriteDecision}
                        onChange={handleChange}
                        maxLength={50}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="refLevee">Reference Levee</label>
                    <InputText
                        id="refLevee"
                        name="refLevee"
                        value={action.refLevee}
                        onChange={handleChange}
                        maxLength={50}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="observation">Observation</label>
                    <InputText
                        id="observation"
                        name="observation"
                        value={action.observation}
                        onChange={handleChange}
                        maxLength={100}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="motivation">Motivation</label>
                    <InputTextarea
                        id="motivation"
                        name="motivation"
                        value={action.motivation}
                        onChange={handleChange}
                        rows={3}
                        maxLength={300}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="defense">Defense</label>
                    <InputTextarea
                        id="defense"
                        name="defense"
                        value={action.defense}
                        onChange={handleChange}
                        rows={3}
                        maxLength={300}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActionDisciplinaireForm;
