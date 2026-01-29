'use client';

import React from "react";
import { SaisiePrime } from "./SaisiePrime";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PrimeParametre } from "../../../settings/primeParametre/PrimeParametre";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";

interface SaisiePrimeFormProps {
    saisiePrime: SaisiePrime;
    primeParametres: PrimeParametre[];
    periodePaies: PeriodePaie[];
    selectedPrimeParametre: PrimeParametre | null;
    selectedPeriodePaie: PeriodePaie | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const SaisiePrimeForm: React.FC<SaisiePrimeFormProps> = ({
    saisiePrime,
    primeParametres,
    periodePaies,
    selectedPrimeParametre,
    selectedPeriodePaie,
    handleChange,
    handleNumberChange,
    handleDropDownSelect,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

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
                        value={saisiePrime.periodeId}
                        options={periodePaies.map(p => ({ label: getPeriodeLabel(p), value: p.periodeId }))}
                        onChange={handleDropDownSelect}
                        placeholder={periodePaies.length === 0 ? "Aucune période ouverte" : "Sélectionner la période"}
                        disabled={isEditMode || periodePaies.length === 0}
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
                        value={saisiePrime.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        disabled={isEditMode}
                        maxLength={15}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="employeeFirstName">Prénom</label>
                    <InputText 
                        id="employeeFirstName" 
                        name="employeeFirstName" 
                        value={saisiePrime.employeeFirstName || ''} 
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="employeeLastName">Nom</label>
                    <InputText 
                        id="employeeLastName" 
                        name="employeeLastName" 
                        value={saisiePrime.employeeLastName || ''} 
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                {/* Prime Selection */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="codePrime">Prime *</label>
                    <Dropdown 
                        name="codePrime" 
                        value={saisiePrime.codePrime} 
                        options={primeParametres} 
                        optionLabel="libellePrime" 
                        optionValue="codePrime" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la prime"
                        disabled={isEditMode}
                        required
                        filter
                        showClear
                    />
                </div>

                {/* Taux (auto-filled from selected prime) */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="taux">Taux (%)</label>
                    <InputNumber 
                        id="taux"
                        value={saisiePrime.taux} 
                        onValueChange={(e) => handleNumberChange('taux', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                        min={0}
                        max={100}
                        readOnly={!!selectedPrimeParametre}
                    />
                </div>

                {/* Montant */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="montant">Montant *</label>
                    <InputNumber 
                        id="montant"
                        value={saisiePrime.montant} 
                        onValueChange={(e) => handleNumberChange('montant', e.value)}
                        mode="currency" 
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        required
                    />
                </div>

                {/* Display selected prime info */}
                {selectedPrimeParametre && (
                    <>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="primeLibelle">Libellé Prime</label>
                            <InputText 
                                id="primeLibelle" 
                                value={selectedPrimeParametre.libellePrime} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="imposable">Imposable</label>
                            <InputText 
                                id="imposable" 
                                value={selectedPrimeParametre.imposable ? 'Oui' : 'Non'} 
                                readOnly
                                className="p-inputtext-sm"
                            />
                        </div>

                        {selectedPrimeParametre.compteCompta && (
                            <div className="field col-12 md:col-3">
                                <label htmlFor="compteCompta">Compte Comptable</label>
                                <InputText 
                                    id="compteCompta" 
                                    value={selectedPrimeParametre.compteCompta} 
                                    readOnly
                                    className="p-inputtext-sm"
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Generated ID display for edit mode */}
                {isEditMode && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="id">ID Prime</label>
                        <InputText
                            id="id"
                            value={saisiePrime.id?.toString() || ''}
                            readOnly
                            className="p-inputtext-sm"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaisiePrimeForm;