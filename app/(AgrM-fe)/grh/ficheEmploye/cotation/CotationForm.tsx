'use client';

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Cotation } from "./Cotation";
import { Notation } from "../../settings/notation/Notation";

interface CotationProps {
    cotation: Cotation;
    notations: Notation[];
    selectedNotation: Notation | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const CotationForm: React.FC<CotationProps> = ({
    cotation,
    notations,
    selectedNotation,
    handleChange,
    handleNumberChange,
    handleDropdownChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    const notationOptions = notations.map(notation => ({
        label: `${notation.notations} (${notation.statut})`,
        value: notation.notations
    }));

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText
                        id="matriculeId"
                        name="matriculeId"
                        value={cotation.matriculeId}
                        onChange={handleChange}
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        disabled={isEditMode || searchLoading}
                        maxLength={15}
                        required
                    />
                    {searchLoading && <small className="p-info">Chargement des informations employé...</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="employeeName">Nom</label>
                    <InputText
                        id="employeeName"
                        value={cotation.employeeName || ''}
                        readOnly
                        className="p-inputtext-filled"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="employeeFirstName">Prénom</label>
                    <InputText
                        id="employeeFirstName"
                        value={cotation.employeeFirstName || ''}
                        readOnly
                        className="p-inputtext-filled"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="statut">Statut</label>
                    <InputText
                        id="statut"
                        value={cotation.statut || ''}
                        readOnly
                        className="p-inputtext-filled"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="exercice">Exercice *</label>
                    <InputNumber
                        id="exercice"
                        value={cotation.exercice}
                        onValueChange={(e) => handleNumberChange('exercice', e.value)}
                        showButtons
                        min={2000}
                        max={2099}
                        useGrouping={false}
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="cote">Notation *</label>
                    <Dropdown
                        id="cote"
                        name="cote"
                        value={cotation.cote}
                        options={notationOptions}
                        onChange={(e) => handleDropdownChange('cote', e.value)}
                        placeholder="Sélectionner une notation"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="noteObtenue">Note Obtenue *</label>
                    <InputNumber
                        id="noteObtenue"
                        value={cotation.noteObtenue}
                        onValueChange={(e) => handleNumberChange('noteObtenue', e.value)}
                        showButtons
                        min={0}
                        max={20}
                        maxFractionDigits={2}
                        minFractionDigits={2}
                        required
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrPoints1">Points Entre</label>
                    <InputNumber
                        id="nbrPoints1"
                        value={cotation.nbrPoints1}
                        onValueChange={(e) => handleNumberChange('nbrPoints1', e.value)}
                        showButtons
                        min={0}
                        maxFractionDigits={2}
                        minFractionDigits={2}
                        readOnly={selectedNotation !== null}
                        className={selectedNotation !== null ? "p-inputtext-filled" : ""}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbrPoints2">Et</label>
                    <InputNumber
                        id="nbrPoints2"
                        value={cotation.nbrPoints2}
                        onValueChange={(e) => handleNumberChange('nbrPoints2', e.value)}
                        showButtons
                        min={0}
                        maxFractionDigits={2}
                        minFractionDigits={2}
                        readOnly={selectedNotation !== null}
                        className={selectedNotation !== null ? "p-inputtext-filled" : ""}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="baseAncienne">Base Ancienne *</label>
                    <InputNumber
                        id="baseAncienne"
                        value={cotation.baseAncienne}
                        onValueChange={(e) => handleNumberChange('baseAncienne', e.value)}
                        showButtons
                        min={0}
                        mode="currency"
                        currency="BIF"
                        locale="fr-BI"
                        required
                    />
                </div>

                <div className="field col-12">
                    <label htmlFor="commentaire">Commentaire</label>
                    <InputTextarea
                        id="commentaire"
                        name="commentaire"
                        value={cotation.commentaire}
                        onChange={handleChange}
                        rows={3}
                        maxLength={100}
                        autoResize
                    />
                </div>
            </div>
        </div>
    );
};

export default CotationForm;