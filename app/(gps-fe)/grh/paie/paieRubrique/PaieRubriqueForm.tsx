'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { PaieRubrique } from "./PaieRubrique";

interface PaieParametreProps {
    paieParametre: PaieRubrique;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PaieRubriqueForm: React.FC<PaieParametreProps> = ({
    paieParametre, 
    handleChange, 
    handleNumberChange
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* First Row */}
                <div className="field col-6">
                    <label htmlFor="tauxInssPensionScPers">Taux INSS Pension Sous-Contrat par Salariai :</label>
                    <InputNumber 
                        id="tauxInssPensionScPers"
                        value={paieParametre.tauxInssPensionScPers} 
                        onValueChange={(e) => handleNumberChange('tauxInssPensionScPers', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxInssPensionSsPers">Taux INSS Pension Sous Statut par Salariai :</label>
                    <InputNumber 
                        id="tauxInssPensionSsPers"
                        value={paieParametre.tauxInssPensionSsPers} 
                        onValueChange={(e) => handleNumberChange('tauxInssPensionSsPers', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Second Row */}
                <div className="field col-6">
                    <label htmlFor="tauxInssPensionSCemp">Taux INSS Pension Sous-Contrat par Patronal :</label>
                    <InputNumber 
                        id="tauxInssPensionSCemp"
                        value={paieParametre.tauxInssPensionSCemp} 
                        onValueChange={(e) => handleNumberChange('tauxInssPensionSCemp', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxInssPensionSsEmp">TauxINSS Pension Sous Statut par Patronal :</label>
                    <InputNumber 
                        id="tauxInssPensionSsEmp"
                        value={paieParametre.tauxInssPensionSsEmp} 
                        onValueChange={(e) => handleNumberChange('tauxInssPensionSsEmp', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Third Row */}
                <div className="field col-6">
                    <label htmlFor="tauxInssRisqueSCemp">Taux INSS Risque Sous Contrat par Patronal :</label>
                    <InputNumber 
                        id="tauxInssRisqueSCemp"
                        value={paieParametre.tauxInssRisqueSCemp} 
                        onValueChange={(e) => handleNumberChange('tauxInssRisqueSCemp', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxInssRisqueSsEmp">Taux INSS Risque Sous Statut par Patronal :</label>
                    <InputNumber 
                        id="tauxInssRisqueSsEmp"
                        value={paieParametre.tauxInssRisqueSsEmp} 
                        onValueChange={(e) => handleNumberChange('tauxInssRisqueSsEmp', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Fourth Row */}
                <div className="field col-6">
                    <label htmlFor="plafondBasePension">Plafond Base Pension :</label>
                    <InputNumber 
                        id="plafondBasePension"
                        value={paieParametre.plafondBasePension} 
                        onValueChange={(e) => handleNumberChange('plafondBasePension', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="plafondBaseRisque">Plafond Base Risque :</label>
                    <InputNumber 
                        id="plafondBaseRisque"
                        value={paieParametre.plafondBaseRisque} 
                        onValueChange={(e) => handleNumberChange('plafondBaseRisque', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>

                {/* Fifth Row */}
                <div className="field col-6">
                    <label htmlFor="tauxMfpPers">Taux MFP par Patronal :</label>
                    <InputNumber 
                        id="tauxMfpPers"
                        value={paieParametre.tauxMfpPers} 
                        onValueChange={(e) => handleNumberChange('tauxMfpPers', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxMfpEmp">Taux MFP par Salariai :</label>
                    <InputNumber 
                        id="tauxMfpEmp"
                        value={paieParametre.tauxMfpEmp} 
                        onValueChange={(e) => handleNumberChange('tauxMfpEmp', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Sixth Row */}
                <div className="field col-6">
                    <label htmlFor="tauxLogementSc">Taux Logement Sous Contrat :</label>
                    <InputNumber 
                        id="tauxLogementSc"
                        value={paieParametre.tauxLogementSc} 
                        onValueChange={(e) => handleNumberChange('tauxLogementSc', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxLogementSs">Taux Logement Sous Statut :</label>
                    <InputNumber 
                        id="tauxLogementSs"
                        value={paieParametre.tauxLogementSs} 
                        onValueChange={(e) => handleNumberChange('tauxLogementSs', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Seventh Row */}
                <div className="field col-6">
                    <label htmlFor="enfantMontant">Alloc.Familiale(Enfant) :</label>
                    <InputNumber 
                        id="enfantMontant"
                        value={paieParametre.enfantMontant} 
                        onValueChange={(e) => handleNumberChange('enfantMontant', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="conjointMontant">Alloc.Familiale(Conjoint) :</label>
                    <InputNumber 
                        id="conjointMontant"
                        value={paieParametre.conjointMontant} 
                        onValueChange={(e) => handleNumberChange('conjointMontant', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>

                {/* Eighth Row */}
                <div className="field col-6">
                    <label htmlFor="nbrPersChargeDeduire">Nombre de Personnes en Charge à Déduire :</label>
                    <InputNumber 
                        id="nbrPersChargeDeduire"
                        value={paieParametre.nbrPersChargeDeduire} 
                        onValueChange={(e) => handleNumberChange('nbrPersChargeDeduire', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="montantPersChargeDeduire">Montant de Personne en Charge à Déduire :</label>
                    <InputNumber 
                        id="montantPersChargeDeduire"
                        value={paieParametre.montantPersChargeDeduire} 
                        onValueChange={(e) => handleNumberChange('montantPersChargeDeduire', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                    />
                </div>

                {/* Ninth Row */}
                <div className="field col-6">
                    <label htmlFor="tauxIprPlafond">Taux IPR Plafond :</label>
                    <InputNumber 
                        id="tauxIprPlafond"
                        value={paieParametre.tauxIprPlafond} 
                        onValueChange={(e) => handleNumberChange('tauxIprPlafond', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="iprPlafond">IPR Plafond :</label>
                    <InputNumber 
                        id="iprPlafond"
                        value={paieParametre.iprPlafond} 
                        onValueChange={(e) => handleNumberChange('iprPlafond', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>

                {/* Tenth Row */}
                <div className="field col-6">
                    <label htmlFor="tauxDepla">Taux Deplacement IPR :</label>
                    <InputNumber 
                        id="tauxDepla"
                        value={paieParametre.tauxDepla} 
                        onValueChange={(e) => handleNumberChange('tauxDepla', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxDeplaIpr">Taux Deplacement :</label>
                    <InputNumber 
                        id="tauxDeplaIpr"
                        value={paieParametre.tauxDeplaIpr} 
                        onValueChange={(e) => handleNumberChange('tauxDeplaIpr', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>

                {/* Eleventh Row */}
                <div className="field col-6">
                    <label htmlFor="tauxPensionComplPers">Taux Pension Compl. Pers :</label>
                    <InputNumber 
                        id="tauxPensionComplPers"
                        value={paieParametre.tauxPensionComplPers} 
                        onValueChange={(e) => handleNumberChange('tauxPensionComplPers', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxPensionComplPatr">Taux Pension Compl. Patr :</label>
                    <InputNumber 
                        id="tauxPensionComplPatr"
                        value={paieParametre.tauxPensionComplPatr} 
                        onValueChange={(e) => handleNumberChange('tauxPensionComplPatr', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                    />
                </div>

                {/* Last Row */}
                <div className="field col-6">
                    <label htmlFor="nbrJrsPreste">Nombre de Jours Presté :</label>
                    <InputNumber 
                        id="nbrJrsPreste"
                        value={paieParametre.nbrJrsPreste} 
                        onValueChange={(e) => handleNumberChange('nbrJrsPreste', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="paramId">ParamId :</label>
                    <InputNumber 
                        id="paramId"
                        value={paieParametre.paramId} 
                        onValueChange={(e) => handleNumberChange('paramId', e.value)}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={0}
                        disabled
                    />
                </div>
            </div>
        </div>
    );
}

export default PaieRubriqueForm;