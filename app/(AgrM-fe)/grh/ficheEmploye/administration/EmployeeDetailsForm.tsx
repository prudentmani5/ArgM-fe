'use client'

import React from "react";
import { EmployeeDetail } from "./employeeDetails";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";

interface EmployeeDetailsFormProps {
    employeeDetail: EmployeeDetail;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: InputNumberValueChangeEvent) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    employeeNom?: string;
    employeePrenom?: string;
    isEditMode?: boolean;
}

const EmployeeDetailsForm: React.FC<EmployeeDetailsFormProps> = ({
    employeeDetail,
    handleChange,
    handleValueChange,
    handleDropDownSelect,
    handleCheckboxChange,
    handleMatriculeBlur,
    employeeNom = '',
    employeePrenom = '',
    isEditMode = false
}) => {
    
    const maritalStatusOptions = [
        { label: "Célibataire", value: "C" },
        { label: "Marié(e)", value: "M" },
        { label: "Divorcé(e)", value: "D" },
        { label: "Veuf/Veuve", value: "V" },
    ];

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Basic Information */}
                <div className="field col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText
                        id="matriculeId"
                        type="text"
                        name="matriculeId"
                        value={employeeDetail.matriculeId}
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
                <div className="field col-3">
                    <label htmlFor="employeeNom">Nom</label>
                    <InputText
                        id="employeeNom"
                        type="text"
                        value={employeeNom}
                        readOnly
                        disabled
                        style={{ backgroundColor: '#f8f9fa' }}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="employeePrenom">Prénom</label>
                    <InputText
                        id="employeePrenom"
                        type="text"
                        value={employeePrenom}
                        readOnly
                        disabled
                        style={{ backgroundColor: '#f8f9fa' }}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="etatCivil">État Civil *</label>
                    <Dropdown 
                        name="etatCivil" 
                        value={employeeDetail.etatCivil} 
                        options={maritalStatusOptions} 
                        optionLabel="label" 
                        optionValue="value" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner l'état civil"
                        required
                    />
                </div>
                
                {/* Family Information */}
                <div className="field col-3">
                    <label htmlFor="nbreEnfant">Nombre d'enfants *</label>
                    <InputNumber 
                        id="nbreEnfant" 
                        name="Nbre_Enfant" 
                        value={employeeDetail.Nbre_Enfant} 
                        onValueChange={handleValueChange} 
                        min={0}
                        showButtons
                    />
                </div>
                <div className="field col-3 flex align-items-center">
                    <Checkbox 
                        inputId="conjointSalarie" 
                        name="conjointSalarie" 
                        checked={employeeDetail.conjointSalarie} 
                        onChange={handleCheckboxChange} 
                    />
                    <label htmlFor="conjointSalarie" className="ml-2">Conjoint Salarié</label>
                </div>

                {/* Contact Information */}
                <div className="field col-3">
                    <label htmlFor="email">email</label>
                    <InputText 
                        id="email" 
                        type="email" 
                        name="email" 
                        value={employeeDetail.email || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="adresse">adresse</label>
                    <InputText 
                        id="adresse" 
                        type="text" 
                        name="adresse" 
                        value={employeeDetail.adresse || ''} 
                        onChange={handleChange} 
                    />
                </div>

                {/* Phone Numbers */}
                <div className="field col-3">
                    <label htmlFor="telBureau">Téléphone Bureau</label>
                    <InputText 
                        id="telBureau" 
                        type="tel" 
                        name="telBureau" 
                        value={employeeDetail.telBureau || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="telHabitat">Téléphone Domicile</label>
                    <InputText 
                        id="telHabitat" 
                        type="tel" 
                        name="telHabitat" 
                        value={employeeDetail.telHabitat || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="telMobile1">Téléphone Mobile 1</label>
                    <InputText 
                        id="telMobile1" 
                        type="tel" 
                        name="telMobile1" 
                        value={employeeDetail.telMobile1 || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="telMobile2">Téléphone Mobile 2</label>
                    <InputText 
                        id="telMobile2" 
                        type="tel" 
                        name="TelMobile2" 
                        value={employeeDetail.TelMobile2 || ''} 
                        onChange={handleChange} 
                    />
                </div>

                {/* References */}
                <div className="field col-3">
                    <label htmlFor="refExtraitCasier">Ref. Extrait Casier Judiciaire</label>
                    <InputText 
                        id="refExtraitCasier" 
                        type="text" 
                        name="refExtraitCasierJudiciaire" 
                        value={employeeDetail.refExtraitCasierJudiciaire || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="refLettreEngagement">Ref. Lettre Engagement</label>
                    <InputText 
                        id="refLettreEngagement" 
                        type="text" 
                        name="refLettreEngagement" 
                        value={employeeDetail.refLettreEngagement || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="refAffectation">Ref. Affectation</label>
                    <InputText 
                        id="refAffectation" 
                        type="text" 
                        name="refAffectation" 
                        value={employeeDetail.refAffectation || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="refAvancementGrade">Ref. Avancement Grade</label>
                    <InputText 
                        id="refAvancementGrade" 
                        type="text" 
                        name="refAvancementGrade" 
                        value={employeeDetail.refAvancementGrade || ''} 
                        onChange={handleChange} 
                    />
                </div>

                {/* Vacation Days */}
                <div className="field col-3">
                    <label htmlFor="nbJoursConge">Nb Jours Congé</label>
                    <InputNumber 
                        id="nbJoursConge" 
                        name="nbJoursConge" 
                        value={employeeDetail.nbJoursConge} 
                        onValueChange={handleValueChange} 
                        min={0}
                        showButtons
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="nbJoursCongeAnneePrec">Nb Jours Congé Année Précédente</label>
                    <InputNumber 
                        id="nbJoursCongeAnneePrec" 
                        name="NbJoursCongeAnneePrec" 
                        value={employeeDetail.NbJoursCongeAnneePrec} 
                        onValueChange={handleValueChange} 
                        min={0}
                        showButtons
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsForm;