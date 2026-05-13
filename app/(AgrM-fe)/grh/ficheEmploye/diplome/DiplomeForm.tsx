'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Diplome } from "./Diplome";
import { Pays } from "../../settings/pays/Pays";

interface TypeDiplome {
    typeDiplomeId: string;
    libelle: string;
}

interface DiplomeFormProps {
    diplome: Diplome;
    employeeName: string;
    typeDiplomes: TypeDiplome[];
    pays: Pays[];
    selectedTypeDiplome: TypeDiplome | null;
    selectedPays: Pays | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: any) => void;
    handleCalendarChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const DiplomeForm: React.FC<DiplomeFormProps> = ({ 
    diplome, 
    employeeName,
    typeDiplomes,
    pays,
    selectedTypeDiplome,
    selectedPays,
    handleChange, 
    handleNumberChange,
    handleCalendarChange,
    handleDropDownSelect,
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
                        value={diplome.matriculeId} 
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

                <div className="field col-12 md:col-6">
                    <label htmlFor="typeDiplomeId">Type de Diplôme *</label>
                    <Dropdown 
                        name="typeDiplomeId" 
                        value={diplome.typeDiplomeId} 
                        options={typeDiplomes} 
                        optionLabel="libelle" 
                        optionValue="typeDiplomeId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner le type de diplôme"
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="paysId">Pays *</label>
                    <Dropdown 
                        name="paysId" 
                        value={diplome.paysId} 
                        options={pays} 
                        optionLabel="nomPays" 
                        optionValue="paysId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner le pays"
                        required
                    />
                </div>

                <div className="field col-12 md:col-8">
                    <label htmlFor="institut">Institut *</label>
                    <InputText 
                        id="institut" 
                        name="institut" 
                        value={diplome.institut} 
                        onChange={handleChange} 
                        maxLength={50}
                        required
                        placeholder="Nom de l'institution"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateObtention">Date d'Obtention *</label>
                    <Calendar 
                        id="dateObtention" 
                        name="dateObtention" 
                        value={diplome.dateObtention ? new Date(diplome.dateObtention.split('/').reverse().join('-')) : null}
                        onChange={handleCalendarChange} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="note">Note *</label>
                    <InputNumber 
                        id="note" 
                        name="note"
                        value={diplome.note} 
                        onValueChange={handleNumberChange}
                        min={0}
                        max={20}
                        maxFractionDigits={2}
                        suffix=" / 20"
                        required
                    />
                </div>

                <div className="field col-12 md:col-9">
                    <label htmlFor="referenceEquivalence">Référence d'Équivalence</label>
                    <InputText 
                        id="referenceEquivalence" 
                        name="referenceEquivalence" 
                        value={diplome.referenceEquivalence} 
                        onChange={handleChange} 
                        maxLength={100}
                        placeholder="Référence ou numéro d'équivalence"
                    />
                </div>
            </div>
        </div>
    );
};

export default DiplomeForm;