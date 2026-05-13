'use client';

import React from "react";
import { SaisieRetenue } from "./SaisieRetenue";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { RetenueParametre } from "../../../settings/retenueParametre/RetenueParametre";
import { Banque } from "../../../settings/banque/Banque";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";

interface SaisieRetenueFormProps {
    saisieRetenue: SaisieRetenue;
    retenueParametres: RetenueParametre[];
    banques: Banque[];
    periodePaies: PeriodePaie[];
    selectedRetenueParametre: RetenueParametre | null;
    selectedBanque: Banque | null;
    selectedPeriodePaie: PeriodePaie | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const SaisieRetenueForm: React.FC<SaisieRetenueFormProps> = ({
    saisieRetenue,
    retenueParametres,
    banques,
    periodePaies,
    selectedRetenueParametre,
    selectedBanque,
    selectedPeriodePaie,
    handleChange,
    handleNumberChange,
    handleDropDownSelect,
    handleCheckboxChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    const isClosed = saisieRetenue.cloture || false;

    // Format period label for dropdown
    const getPeriodeLabel = (periode: PeriodePaie) => {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${monthNames[periode.mois - 1]} ${periode.annee}`;
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Période Paie Selection */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="periodeId">Période de Paie *</label>
                    <Dropdown
                        name="periodeId"
                        value={saisieRetenue.periodeId}
                        options={periodePaies.map(p => ({ label: getPeriodeLabel(p), value: p.periodeId }))}
                        onChange={handleDropDownSelect}
                        placeholder={periodePaies.length === 0 ? "Aucune période ouverte" : "Sélectionner la période"}
                        disabled={isEditMode || isClosed || periodePaies.length === 0}
                        required
                        filter
                        showClear
                        emptyMessage="Aucune période de paie ouverte disponible"
                        emptyFilterMessage="Aucune période trouvée"
                    />
                </div>

                {/* Matricule and Employee Info */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={saisieRetenue.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        disabled={isEditMode || isClosed}
                        maxLength={15}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="employeeFirstName">Prénom</label>
                    <InputText 
                        id="employeeFirstName" 
                        name="employeeFirstName" 
                        value={saisieRetenue.employeeFirstName || ''} 
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="employeeLastName">Nom</label>
                    <InputText 
                        id="employeeLastName" 
                        name="employeeLastName" 
                        value={saisieRetenue.employeeLastName || ''} 
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                {/* Retenue Selection */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="codeRet">Retenue *</label>
                    <Dropdown 
                        name="codeRet" 
                        value={saisieRetenue.codeRet} 
                        options={retenueParametres} 
                        optionLabel="libelleRet" 
                        optionValue="codeRet" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la retenue"
                        disabled={isEditMode || isClosed}
                        required
                        filter
                        showClear
                    />
                </div>

                {/* Taux */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="taux">Taux</label>
                    <InputNumber 
                        id="taux"
                        value={saisieRetenue.taux} 
                        onValueChange={(e) => handleNumberChange('taux', e.value)}
                        mode="decimal" 
                        minFractionDigits={0} 
                        maxFractionDigits={0}
                        min={0}
                        max={100}
                        disabled={isClosed}
                    />
                </div>

                {/* Montant */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="montant">Montant *</label>
                    <InputNumber 
                        id="montant"
                        value={saisieRetenue.montant} 
                        onValueChange={(e) => handleNumberChange('montant', e.value)}
                        mode="currency" 
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        required
                        disabled={isClosed}
                    />
                </div>

                {/* Banque Selection */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="codeBanque">Banque</label>
                    <Dropdown 
                        name="codeBanque" 
                        value={saisieRetenue.codeBanque} 
                        options={banques} 
                        optionLabel="libelleBanque" 
                        optionValue="codeBanque" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la banque"
                        disabled={isClosed}
                        filter
                        showClear
                    />
                </div>

                {/* Compte */}
                <div className="field col-12 md:col-4">
                    <label htmlFor="compte">Compte</label>
                    <InputText 
                        id="compte" 
                        name="compte" 
                        value={saisieRetenue.compte || ''} 
                        onChange={handleChange} 
                        maxLength={200}
                        disabled={isClosed}
                    />
                </div>

                {/* Reference */}
                <div className="field col-12 md:col-4">
                    <label htmlFor="reference">Référence</label>
                    <InputText 
                        id="reference" 
                        name="reference" 
                        value={saisieRetenue.reference || ''} 
                        onChange={handleChange} 
                        maxLength={30}
                        disabled={isClosed}
                    />
                </div>

                {/* Status Checkboxes */}
                <div className="field col-12 md:col-2">
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="actif" 
                            name="actif"
                            checked={saisieRetenue.actif} 
                            onChange={handleCheckboxChange}
                            disabled={isClosed || (!isEditMode)}
                        />
                        <label htmlFor="actif" className="ml-2">Actif</label>
                    </div>
                </div>

                <div className="field col-12 md:col-2">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="cloture"
                            name="cloture"
                            checked={saisieRetenue.cloture}
                            onChange={handleCheckboxChange}
                            disabled={!isEditMode}
                        />
                        <label htmlFor="cloture" className="ml-2">Clôturé</label>
                    </div>
                </div>

                {/* Display selected retenue info */}
                {selectedRetenueParametre && (
                    <>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="retenueLibelle">Libellé Retenue</label>
                            <InputText 
                                id="retenueLibelle" 
                                value={selectedRetenueParametre.libelleRet} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="imposable">Imposable</label>
                            <InputText 
                                id="imposable" 
                                value={selectedRetenueParametre.imposable ? 'Oui' : 'Non'} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="estCredit">Crédit</label>
                            <InputText 
                                id="estCredit" 
                                value={selectedRetenueParametre.estCredit ? 'Oui' : 'Non'} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        {selectedRetenueParametre.compteCompta && (
                            <div className="field col-12 md:col-3">
                                <label htmlFor="compteCompta">Compte Comptable</label>
                                <InputText 
                                    id="compteCompta" 
                                    value={selectedRetenueParametre.compteCompta} 
                                    readOnly
                                    className="p-inputtext-sm"
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Display selected banque info */}
                {selectedBanque && (
                    <>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="banqueLibelle">Libellé Banque</label>
                            <InputText 
                                id="banqueLibelle" 
                                value={selectedBanque.libelleBanque} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="banqueSigle">Sigle</label>
                            <InputText 
                                id="banqueSigle" 
                                value={selectedBanque.sigle} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>
                    </>
                )}

                {/* Generated ID display for edit mode */}
                {isEditMode && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="retenueId">ID Retenue</label>
                        <InputText 
                            id="retenueId" 
                            value={saisieRetenue.retenueId} 
                            readOnly
                            className="p-inputtext-sm"
                        />
                    </div>
                )}

                {/* Warning message for closed retenues */}
                {isClosed && (
                    <div className="field col-12">
                        <div className="p-message p-message-warn">
                            <div className="p-message-wrapper">
                                <span className="p-message-icon pi pi-exclamation-triangle"></span>
                                <div className="p-message-text">
                                    Cette retenue est clôturée et ne peut plus être modifiée.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaisieRetenueForm;