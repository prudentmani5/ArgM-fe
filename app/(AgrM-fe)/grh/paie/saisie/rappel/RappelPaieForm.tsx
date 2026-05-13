'use client';

import React from "react";
import { RappelPaie } from "./RappelPaie";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";

interface RappelPaieFormProps {
    rappelPaie: RappelPaie;
    periodePaies: PeriodePaie[];
    selectedPeriodePaie: PeriodePaie | null;
    handleNumberChange: (field: string, value: number | null) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    handleMatriculeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const RappelPaieForm: React.FC<RappelPaieFormProps> = ({
    rappelPaie,
    periodePaies,
    selectedPeriodePaie,
    handleNumberChange,
    handleDropDownSelect,
    handleMatriculeBlur,
    handleMatriculeChange,
    isEditMode = false,
    searchLoading = false
}) => {

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
                        value={rappelPaie.periodeId}
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

                {/* Matricule */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText
                        id="matriculeId"
                        name="matriculeId"
                        value={rappelPaie.matriculeId}
                        onChange={handleMatriculeChange}
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

                {/* Nom */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="nom">Nom</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={rappelPaie.nom || ''}
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                {/* Prénom */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="prenom">Prénom</label>
                    <InputText
                        id="prenom"
                        name="prenom"
                        value={rappelPaie.prenom || ''}
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                {/* Rappel Positif Imposable */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="rappPositifImp">Rappel Positif Imp.</label>
                    <InputNumber
                        id="rappPositifImp"
                        value={rappelPaie.rappPositifImp}
                        onValueChange={(e) => handleNumberChange('rappPositifImp', e.value)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                {/* Rappel Positif Non Imposable */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="rappPositifNonImp">Rappel Positif Non Imp.</label>
                    <InputNumber
                        id="rappPositifNonImp"
                        value={rappelPaie.rappPositifNonImp}
                        onValueChange={(e) => handleNumberChange('rappPositifNonImp', e.value)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                {/* Rappel Négatif Imposable */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="rappNegatifImp">Rappel Négatif Imp.</label>
                    <InputNumber
                        id="rappNegatifImp"
                        value={rappelPaie.rappNegatifImp}
                        onValueChange={(e) => handleNumberChange('rappNegatifImp', e.value)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                {/* Rappel Négatif Non Imposable */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="rappNegatifNonImp">Rappel Négatif Non Imp.</label>
                    <InputNumber
                        id="rappNegatifNonImp"
                        value={rappelPaie.rappNegatifNonImp}
                        onValueChange={(e) => handleNumberChange('rappNegatifNonImp', e.value)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default RappelPaieForm;
