'use client'

import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { FormationStage } from "./FormationStage";
import { DomaineFormation } from "../../settings/domaineformation/DomaineFormaton";

interface TypeDiplome {
    typeDiplomeId: string;
    diplome: string;
}

interface FormationStageFormProps {
    formationStage: FormationStage;
    employeeName: string;
    domaines: DomaineFormation[];
    typeDiplomes: TypeDiplome[];
    selectedDomaine: DomaineFormation | null;
    selectedTypeDiplome: TypeDiplome | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: any) => void;
    handleCalendarChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleRadioChange: (e: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const FormationStageForm: React.FC<FormationStageFormProps> = ({ 
    formationStage, 
    employeeName,
    domaines,
    typeDiplomes,
    selectedDomaine,
    selectedTypeDiplome,
    handleChange, 
    handleNumberChange,
    handleCalendarChange,
    handleDropDownSelect,
    handleRadioChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    const formatDateToString = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={formationStage.matriculeId} 
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
                    <label htmlFor="domaineId">Domaine de Formation *</label>
                    <Dropdown 
                        name="domaineId" 
                        value={formationStage.domaineId} 
                        options={domaines} 
                        optionLabel="libelle" 
                        optionValue="domaineId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner le domaine"
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="institut">Institut *</label>
                    <InputText 
                        id="institut" 
                        name="institut" 
                        value={formationStage.institut} 
                        onChange={handleChange} 
                        maxLength={50}
                        required
                        placeholder="Nom de l'institution"
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="dateDebut">Date Début *</label>
                    <Calendar 
                        id="dateDebut" 
                        name="dateDebut" 
                        value={formationStage.dateDebut ? new Date(formationStage.dateDebut.split('/').reverse().join('-')) : null}
                        onChange={handleCalendarChange} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="dateFin">Date Fin *</label>
                    <Calendar 
                        id="dateFin" 
                        name="dateFin" 
                        value={formationStage.dateFin ? new Date(formationStage.dateFin.split('/').reverse().join('-')) : null}
                        onChange={handleCalendarChange} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrAnnees">Années</label>
                    <InputNumber 
                        id="nbrAnnees" 
                        name="nbrAnnees"
                        value={formationStage.nbrAnnees} 
                        onValueChange={handleNumberChange}
                        min={0}
                        max={9}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrMois">Mois</label>
                    <InputNumber 
                        id="nbrMois" 
                        name="nbrMois"
                        value={formationStage.nbrMois} 
                        onValueChange={handleNumberChange}
                        min={0}
                        max={99}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrJours">Jours</label>
                    <InputNumber 
                        id="nbrJours" 
                        name="nbrJours"
                        value={formationStage.nbrJours} 
                        onValueChange={handleNumberChange}
                        min={0}
                        max={99}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbrHeures">Heures</label>
                    <InputNumber 
                        id="nbrHeures" 
                        name="nbrHeures"
                        value={formationStage.nbrHeures} 
                        onValueChange={handleNumberChange}
                        min={0}
                        max={99}
                    />
                </div>

                <div className="field col-12">
                    <label>Type de Formation *</label>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex align-items-center">
                            <RadioButton 
                                inputId="certificat" 
                                name="diplomeCertificat" 
                                value="C" 
                                onChange={handleRadioChange} 
                                checked={formationStage.diplomeCertificat === 'C'} 
                            />
                            <label htmlFor="certificat" className="ml-2">Certificat</label>
                        </div>
                        <div className="flex align-items-center">
                            <RadioButton 
                                inputId="diplome" 
                                name="diplomeCertificat" 
                                value="D" 
                                onChange={handleRadioChange} 
                                checked={formationStage.diplomeCertificat === 'D'} 
                            />
                            <label htmlFor="diplome" className="ml-2">Diplôme</label>
                        </div>
                    </div>
                </div>

                {formationStage.diplomeCertificat === 'D' && (
                    <div className="field col-12 md:col-6">
                        <label htmlFor="typeDiplomeId">Type de Diplôme *</label>
                        <Dropdown 
                            name="typeDiplomeId" 
                            value={formationStage.typeDiplomeId} 
                            options={typeDiplomes} 
                            optionLabel="diplome" 
                            optionValue="typeDiplomeId" 
                            onChange={handleDropDownSelect} 
                            placeholder="Sélectionner le type de diplôme"
                            required={formationStage.diplomeCertificat === 'D'}
                        />
                    </div>
                )}

                <div className="field col-12">
                    <label htmlFor="description">Description</label>
                    <InputText 
                        id="description" 
                        name="description" 
                        value={formationStage.description} 
                        onChange={handleChange} 
                        maxLength={100}
                        placeholder="Description de la formation"
                    />
                </div>
            </div>
        </div>
    );
};

export default FormationStageForm;