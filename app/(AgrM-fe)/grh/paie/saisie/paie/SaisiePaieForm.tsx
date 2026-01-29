'use client';

import React from "react";
import { SaisiePaie } from "./SaisiePaie";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";

interface SaisiePaieFormProps {
    saisiePaie: SaisiePaie;
    periodePaies: PeriodePaie[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleCheckboxChange: (field: string, checked: boolean) => void;
    handlePeriodeChange: (periodeId: string) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const SaisiePaieForm: React.FC<SaisiePaieFormProps> = ({
    saisiePaie,
    periodePaies,
    handleChange,
    handleNumberChange,
    handleCheckboxChange,
    handlePeriodeChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}) => {

    // Month names for formatting period display
    const monthNames = [
        'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ];

    // Format PeriodePaie for dropdown display
    const formatPeriodeLabel = (periode: PeriodePaie): string => {
        const monthName = monthNames[periode.mois - 1] || '';
        return `${monthName} ${periode.annee}`;
    };

    // Prepare dropdown options
    const periodeOptions = periodePaies.map(p => ({
        label: formatPeriodeLabel(p),
        value: p.periodeId
    }));

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Header - Employee Info */}
                <div className="field col-12 md:col-4">
                    <label htmlFor="periodeId">Période de Paie</label>
                    <Dropdown
                        id="periodeId"
                        value={saisiePaie.periodeId}
                        options={periodeOptions}
                        onChange={(e) => handlePeriodeChange(e.value)}
                        placeholder="Selectionner la période"
                    />
                </div>
                <div className="field col-12 md:col-4">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={saisiePaie.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        maxLength={15}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="employeeFirstName">Nom-Prénom(s)</label>
                    <InputText
                        id="employeeFirstName"
                        value={`${saisiePaie.employeeFirstName || ''} ${saisiePaie.employeeLastName || ''}`.trim()}
                        readOnly
                        className={searchLoading ? 'p-inputtext-loading' : ''}
                    />
                </div>

                

                {/* First Row - Base, Preste, Rapports */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="base">Base</label>
                    <InputNumber
                        id="base"
                        value={saisiePaie.base}
                        onValueChange={(e) => handleNumberChange('base', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="preste">Jours.Presté</label>
                    <InputNumber 
                        id="preste"
                        value={saisiePaie.preste} 
                        onValueChange={(e) => handleNumberChange('preste', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="saisirJrsPreste" 
                            checked={saisiePaie.saisirJrsPreste} 
                            onChange={(e) => handleCheckboxChange('saisirJrsPreste', e.checked || false)}
                        />
                        <label htmlFor="saisirJrsPreste" className="ml-2">Saisir.Jrs.Presté</label>
                    </div>
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="rappPositifNonImp">Rappel Positif Non Imp</label>
                    <InputNumber 
                        id="rappPositifNonImp"
                        value={saisiePaie.rappPositifNonImp} 
                        onValueChange={(e) => handleNumberChange('rappPositifNonImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="rappNegatifNonImp">Rappel Négatif Non IMPOSABLE</label>
                    <InputNumber 
                        id="rappNegatifNonImp"
                        value={saisiePaie.rappNegatifNonImp} 
                        onValueChange={(e) => handleNumberChange('rappNegatifNonImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                

                <div className="field col-12 md:col-2">
                    <label htmlFor="hs135">HS135</label>
                    <InputNumber 
                        id="hs135"
                        value={saisiePaie.hs135} 
                        onValueChange={(e) => handleNumberChange('hs135', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        locale="fr-FR"
                    />
                </div>

                {/* Second Row */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="logement">Logement</label>
                    <InputNumber 
                        id="logement"
                        value={saisiePaie.logement} 
                        onValueChange={(e) => handleNumberChange('logement', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                {/* <div className="field col-12 md:col-2">
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="logementFixe" 
                            checked={saisiePaie.logementFixe} 
                            onChange={(e) => handleCheckboxChange('logementFixe', e.checked || false)}
                        />
                        <label htmlFor="logementFixe" className="ml-2">Logement.Fixe</label>
                    </div>
                </div> */}

                <div className="field col-12 md:col-2">
                    <label htmlFor="rappPositifImp">Rapple Positif Imp</label>
                    <InputNumber 
                        id="rappPositifImp"
                        value={saisiePaie.rappPositifImp} 
                        onValueChange={(e) => handleNumberChange('rappPositifImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="rappNegatifImp">Rappel Négatif Imp.</label>
                    <InputNumber 
                        id="rappNegatifImp"
                        value={saisiePaie.rappNegatifImp} 
                        onValueChange={(e) => handleNumberChange('rappNegatifImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="deplacement">Déplacement</label>
                    <InputNumber 
                        id="deplacement"
                        value={saisiePaie.deplacement} 
                        onValueChange={(e) => handleNumberChange('deplacement', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="hs160">HS160</label>
                    <InputNumber 
                        id="hs160"
                        value={saisiePaie.hs160} 
                        onValueChange={(e) => handleNumberChange('hs160', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="hs200">HS200</label>
                    <InputNumber 
                        id="hs200"
                        value={saisiePaie.hs200} 
                        onValueChange={(e) => handleNumberChange('hs200', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        locale="fr-FR"
                    />
                </div>

                {/* Third Row */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="primeNonImp">Prime.Non.IMP</label>
                    <InputNumber 
                        id="primeNonImp"
                        value={saisiePaie.primeNonImp} 
                        onValueChange={(e) => handleNumberChange('primeNonImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="allocFam">Alloc.Fam</label>
                    <InputNumber 
                        id="allocFam"
                        value={saisiePaie.allocFam} 
                        onValueChange={(e) => handleNumberChange('allocFam', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="mfpPers">MFP.Pers</label>
                    <InputNumber 
                        id="mfpPers"
                        value={saisiePaie.mfpPers} 
                        onValueChange={(e) => handleNumberChange('mfpPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="soinsPers">Soins de Santé Personnel</label>
                    <InputNumber 
                        id="soinsPers"
                        value={saisiePaie.soinsPers} 
                        onValueChange={(e) => handleNumberChange('soinsPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="montant135">Montant.HS135</label>
                    <InputNumber 
                        id="montant135"
                        value={saisiePaie.montant135} 
                        onValueChange={(e) => handleNumberChange('montant135', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                {/* Fourth Row */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="primeImp">Prime Imposable</label>
                    <InputNumber 
                        id="primeImp"
                        value={saisiePaie.primeImp} 
                        onValueChange={(e) => handleNumberChange('primeImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="baseMfp">Base MFP</label>
                    <InputNumber 
                        id="baseMfp"
                        value={saisiePaie.baseMfp} 
                        onValueChange={(e) => handleNumberChange('baseMfp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="baseInssPension">Base INSS.Pension</label>
                    <InputNumber 
                        id="baseInssPension"
                        value={saisiePaie.baseInssPension} 
                        onValueChange={(e) => handleNumberChange('baseInssPension', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="inssPensionScPers">INSS.Pension.SC.Pers</label>
                    <InputNumber 
                        id="inssPensionScPers"
                        value={saisiePaie.inssPensionScPers} 
                        onValueChange={(e) => handleNumberChange('inssPensionScPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                 <div className="field col-12 md:col-2">
                    <label htmlFor="inssPensionScEmp">INSS.Pension.SC.Emp</label>
                    <InputNumber 
                        id="inssPensionScEmp"
                        value={saisiePaie.inssPensionScEmp} 
                        onValueChange={(e) => handleNumberChange('inssPensionScPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="baseIpr">Base IRE</label>
                    <InputNumber 
                        id="baseIpr"
                        value={saisiePaie.baseIpr} 
                        onValueChange={(e) => handleNumberChange('baseIpr', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="ipr">IRE</label>
                    <InputNumber 
                        id="ipr"
                        value={saisiePaie.ipr} 
                        onValueChange={(e) => handleNumberChange('ipr', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="montant160">Montant.HS160</label>
                    <InputNumber 
                        id="montant160"
                        value={saisiePaie.montant160} 
                        onValueChange={(e) => handleNumberChange('montant160', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                {/* Fifth Row */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="indNonImp">IND.Non.IMP</label>
                    <InputNumber 
                        id="indNonImp"
                        value={saisiePaie.indNonImp} 
                        onValueChange={(e) => handleNumberChange('indNonImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="baseInssRisque">Base.INSS.Risque</label>
                    <InputNumber 
                        id="baseInssRisque"
                        value={saisiePaie.baseInssRisque} 
                        onValueChange={(e) => handleNumberChange('baseInssRisque', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="inssPensionSsPers">INSS.Risque.SS.Pers</label>
                    <InputNumber 
                        id="inssPensionSsPers"
                        value={saisiePaie.inssPensionSsPers} 
                        onValueChange={(e) => handleNumberChange('inssPensionSsPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="retNonImp">Retenue.Non.Imp</label>
                    <InputNumber 
                        id="retNonImp"
                        value={saisiePaie.retNonImp} 
                        onValueChange={(e) => handleNumberChange('retNonImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="retImp">Retenue.Imp</label>
                    <InputNumber 
                        id="retImp"
                        value={saisiePaie.retImp} 
                        onValueChange={(e) => handleNumberChange('retImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="montant200">Montant.HS200</label>
                    <InputNumber 
                        id="montant200"
                        value={saisiePaie.montant200} 
                        onValueChange={(e) => handleNumberChange('montant200', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                {/* Sixth Row */}
                <div className="field col-12 md:col-2">
                    <label htmlFor="indImp">IND.IMP</label>
                    <InputNumber 
                        id="indImp"
                        value={saisiePaie.indImp} 
                        onValueChange={(e) => handleNumberChange('indImp', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="pensionComplPers">Pension.Compl.Pers</label>
                    <InputNumber 
                        id="pensionComplPers"
                        value={saisiePaie.pensionComplPers} 
                        onValueChange={(e) => handleNumberChange('pensionComplPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>
                    
                <div className="field col-12 md:col-2">
                    <label htmlFor="pensionComplPatr">Pension Compl. Patronal</label>
                    <InputNumber
                        id="pensionComplPatr"
                        value={saisiePaie.pensionComplPatr}
                        onValueChange={(e) => handleNumberChange('pensionComplPatr', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="pourcJubile">% Jubilé</label>
                    <InputNumber
                        id="pourcJubile"
                        value={saisiePaie.pourcJubile}
                        onValueChange={(e) => handleNumberChange('pourcJubile', e.value ?? null)}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={2}
                        suffix=" %"
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="jubile">Jubilé</label>
                    <InputNumber
                        id="jubile"
                        value={saisiePaie.jubile}
                        onValueChange={(e) => handleNumberChange('jubile', e.value ?? null)}
                        mode="decimal"
                        minFractionDigits={0}
                        locale="fr-FR"
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="brut" className="font-bold">Montant.Brut</label>
                    <InputNumber 
                        id="brut"
                        value={saisiePaie.brut} 
                        onValueChange={(e) => handleNumberChange('brut', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        className="font-bold"
                        locale="fr-FR"
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="totalRetenue" className="font-bold">Total Retenue</label>
                    <InputNumber 
                        id="totalRetenue"
                        value={saisiePaie.totalRetenue} 
                        onValueChange={(e) => handleNumberChange('totalRetenue', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        className="font-bold"
                        locale="fr-FR"
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="net" className="font-bold text-primary">NET A PAYER</label>
                    <InputNumber 
                        id="net"
                        value={saisiePaie.net} 
                        onValueChange={(e) => handleNumberChange('net', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        className="font-bold text-primary"
                        locale="fr-FR"
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default SaisiePaieForm;