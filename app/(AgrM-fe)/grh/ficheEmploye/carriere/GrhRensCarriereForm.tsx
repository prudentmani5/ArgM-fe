'use client'

import React from "react";
import { GrhRensCarriere } from "./GrhRensCarriere";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Department } from "../settings/departement/Department";

interface GrhCarriereFormProps {
    carriere: GrhRensCarriere;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: any, fieldName: string) => void;
    handleCheckboxChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
    fonctions?: any[];
    grades?: any[];
    departments?: Department[];
    services?: any[];
    collines?: any[];
    indices?: any[];
    categories?: any[];
    banques?: any[];
}

const GrhRensCarriereForm: React.FC<GrhCarriereFormProps> = ({
    carriere,
    handleChange,
    handleNumberChange,
    handleCheckboxChange,
    handleDropDownSelect,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false,
    fonctions = [],
    grades = [],
    departments = [],
    services = [],
    collines = [],
    indices = [],
    categories = [],
    banques = []
}) => {

    const statutOptions = [
        { label: "Actif", value: "ACTIF" },
        { label: "Inactif", value: "INACT" },
        { label: "Suspendu", value: "SUSP" },
        { label: "Retraité", value: "RETR" }
    ];

    return (
        <>
            <div className="card p-fluid">
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="matriculeId">Matricule *</label>
                        <InputText
                            id="matriculeId"
                            name="matriculeId"
                            value={carriere.matriculeId}
                            onChange={handleChange}
                            onBlur={(e) => {
                                if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                    handleMatriculeBlur(e.target.value);
                                }
                            }}
                            required
                            disabled={isEditMode || searchLoading}
                        />
                        {searchLoading && <small className="p-info">Recherche en cours...</small>}
                    </div>

                    {/* Display employee name if available */}
                    {(carriere.nom || carriere.prenom) && (
                        <>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="nom">Nom</label>
                                <InputText
                                    id="nom"
                                    name="nom"
                                    value={carriere.nom || ''}
                                    readOnly
                                    className="p-inputtext-readonly"
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="prenom">Prénom</label>
                                <InputText
                                    id="prenom"
                                    name="prenom"
                                    value={carriere.prenom || ''}
                                    readOnly
                                    className="p-inputtext-readonly"
                                />
                            </div>
                        </>
                    )}

                    <div className="field col-12 md:col-3">
                        <label htmlFor="fonctionId">Fonction</label>
                        <Dropdown
                            name="fonctionId"
                            value={carriere.fonctionId}
                            options={fonctions}
                            optionLabel="libelle"
                            optionValue="fonctionid"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner une fonction"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="gradeId">Grade</label>
                        <Dropdown
                            name="gradeId"
                            value={carriere.gradeId}
                            options={grades}
                            optionLabel="libelle"
                            optionValue="gradeId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner un grade"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="departmentId">Département *</label>
                        <Dropdown
                            name="departmentId"
                            value={carriere.departmentId}
                            options={departments}
                            optionLabel="libelle"
                            optionValue="departmentId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner un département"
                            filter
                            showClear
                            required
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="serviceId">Service *</label>
                        <Dropdown
                            name="serviceId"
                            value={carriere.serviceId}
                            options={services}
                            optionLabel="libelle"
                            optionValue="serviceId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner un service"
                            filter
                            showClear
                            required
                            disabled={!carriere.departmentId}
                        />
                        {!carriere.departmentId && (
                            <small className="p-error">Veuillez d'abord sélectionner un département</small>
                        )}
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="categorieId">Catégorie</label>
                        <Dropdown
                            name="categorieId"
                            value={carriere.categorieId}
                            options={categories}
                            optionLabel="libelle"
                            optionValue="categorieId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner une catégorie"
                            filter
                            showClear
                        />
                    </div>

                    {/* <div className="field col-12 md:col-3">
                        <label htmlFor="collineId">Colline</label>
                        <Dropdown
                            name="collineId"
                            value={carriere.collineId}
                            options={collines}
                            optionLabel="nom"
                            optionValue="collineId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner une colline"
                            filter
                            showClear
                        />
                    </div> */}

                    <div className="field col-12 md:col-3">
                        <label htmlFor="indiceId">Indice</label>
                        <Dropdown
                            name="indiceId"
                            value={carriere.indiceId}
                            options={indices}
                            optionLabel="libelle"
                            optionValue="indiceId"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner un indice"
                            filter
                            showClear
                        />
                    </div>

                    {/* Rest of the form fields remain the same... */}
                    <div className="field col-12 md:col-3">
                        <label htmlFor="anneeEmbauche">Année d'Embauche</label>
                        <InputNumber
                            id="anneeEmbauche"
                            value={carriere.anneeEmbauche}
                            onValueChange={(e) => handleNumberChange(e, 'anneeEmbauche')}
                            useGrouping={false}
                            placeholder="Ex: 2020"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="statut">Statut</label>
                        <Dropdown
                            name="statut"
                            value={carriere.statut}
                            options={statutOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner le statut"
                        />
                    </div>

                    {/* Continue with all other form fields as before... */}
                    <div className="field col-12 md:col-6">
                        <label htmlFor="reference">Référence</label>
                        <InputText
                            id="reference"
                            name="reference"
                            value={carriere.reference}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="echelon">Échelon *</label>
                        <InputNumber
                            id="echelon"
                            value={carriere.echelon}
                            onValueChange={(e) => handleNumberChange(e, 'echelon')}
                            useGrouping={false}
                            min={0}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateObtentionGrade">Date Obtention Grade</label>
                        <InputText
                            id="dateObtentionGrade"
                            name="dateObtentionGrade"
                            value={carriere.dateObtentionGrade}
                            onChange={handleChange}
                            placeholder="YYYY-MM-DD"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateObtentionEchelon">Date Obtention Échelon</label>
                        <InputText
                            id="dateObtentionEchelon"
                            name="dateObtentionEchelon"
                            value={carriere.dateObtentionEchelon}
                            onChange={handleChange}
                            placeholder="YYYY-MM-DD"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="specialite">Spécialité</label>
                        <InputText
                            id="specialite"
                            name="specialite"
                            value={carriere.specialite}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="niveauFormation">Niveau de Formation</label>
                        <InputText
                            id="niveauFormation"
                            name="niveauFormation"
                            value={carriere.niveauFormation}
                            onChange={handleChange}
                        />
                    </div>

                    {/* <div className="field col-12 md:col-3">
                        <label htmlFor="nbrJoursConge">Nombre Jours Congé *</label>
                        <InputNumber
                            id="nbrJoursConge"
                            value={carriere.nbrJoursConge}
                            onValueChange={(e) => handleNumberChange(e, 'nbrJoursConge')}
                            useGrouping={false}
                            min={0}
                            placeholder="0"
                        />
                    </div> */}

                    <div className="field col-12 md:col-3">
                        <label htmlFor="base">Base Salariale *</label>
                        <InputNumber
                            id="base"
                            value={carriere.base}
                            onValueChange={(e) => handleNumberChange(e, 'base')}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="soinsDeSante">Soins de Santé *</label>
                        <InputNumber
                            id="soinsDeSante"
                            value={carriere.soinsDeSante}
                            onValueChange={(e) => handleNumberChange(e, 'soinsDeSante')}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="payeONPR">Payé ONPR</label>
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="payeONPR"
                                name="payeONPR"
                                checked={carriere.payeONPR}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="payeONPR" className="ml-2">Oui</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="calculerDeplacement">Calculer l'indémnité de déplacement</label>
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="calculerDeplacement"
                                name="calculerDeplacement"
                                checked={carriere.calculerDeplacement}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="calculerDeplacement" className="ml-2">Oui</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="tauxPensionComplPers">Taux Pension Compl. Personnel *</label>
                        <InputNumber
                            id="tauxPensionComplPers"
                            value={carriere.tauxPensionComplPers}
                            onValueChange={(e) => handleNumberChange(e, 'tauxPensionComplPers')}
                            suffix="%"
                            min={0}
                            max={100}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="tauxPensionComplPatr">Taux Pension Compl. Patronal *</label>
                        <InputNumber
                            id="tauxPensionComplPatr"
                            value={carriere.tauxPensionComplPatr}
                            onValueChange={(e) => handleNumberChange(e, 'tauxPensionComplPatr')}
                            suffix="%"
                            min={0}
                            max={100}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="tauxIprVacatairePers">Taux IPR Vacataire Personnel *</label>
                        <InputNumber
                            id="tauxIprVacatairePers"
                            value={carriere.tauxIprVacatairePers}
                            onValueChange={(e) => handleNumberChange(e, 'tauxIprVacatairePers')}
                            suffix="%"
                            min={0}
                            max={100}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="tauxIprVacatairePatr">Taux IPR Vacataire Patronal *</label>
                        <InputNumber
                            id="tauxIprVacatairePatr"
                            value={carriere.tauxIprVacatairePatr}
                            onValueChange={(e) => handleNumberChange(e, 'tauxIprVacatairePatr')}
                            suffix="%"
                            min={0}
                            max={100}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="pourcJubile">Taux Cotis. Jubilee</label>
                        <InputNumber
                            id="pourcJubile"
                            value={carriere.pourcJubile}
                            onValueChange={(e) => handleNumberChange(e, 'pourcJubile')}
                            suffix="%"
                            min={0}
                            max={100}
                            placeholder="0"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="codeBanque">Banque</label>
                        <Dropdown
                            name="codeBanque"
                            value={carriere.codeBanque}
                            options={banques}
                            optionLabel="libelleBanque"
                            optionValue="codeBanque"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner une banque"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="compte">Numéro de Compte</label>
                        <InputText
                            id="compte"
                            name="compte"
                            value={carriere.compte}
                            onChange={handleChange}
                            placeholder="Numéro de compte bancaire"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default GrhRensCarriereForm;