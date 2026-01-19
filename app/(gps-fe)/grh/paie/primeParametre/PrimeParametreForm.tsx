'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { PrimeParametre } from "./PrimeParametre";

interface PrimeParametreProps {
    primeParametre: PrimeParametre;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleCheckboxChange: (field: string, checked: boolean) => void;
    isEditMode?: boolean;
}

const PrimeParametreForm: React.FC<PrimeParametreProps> = ({
    primeParametre, 
    handleChange, 
    handleNumberChange,
    handleCheckboxChange,
    isEditMode = false
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="codePrime">Code *</label>
                    <InputText 
                        id="codePrime" 
                        name="codePrime" 
                        value={primeParametre.codePrime} 
                        onChange={handleChange} 
                        maxLength={3}
                        required
                        disabled={isEditMode}
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="libellePrime">Libellé *</label>
                    <InputText 
                        id="libellePrime" 
                        name="libellePrime" 
                        value={primeParametre.libellePrime} 
                        onChange={handleChange} 
                        maxLength={30}
                        required
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="imposable" 
                            checked={primeParametre.imposable} 
                            onChange={(e) => handleCheckboxChange('imposable', e.checked || false)}
                        />
                        <label htmlFor="imposable" className="ml-2">Imposable</label>
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="taux">Taux *</label>
                    <InputNumber 
                        id="taux"
                        value={primeParametre.taux} 
                        onValueChange={(e) => handleNumberChange('taux', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                        required
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="compteCompta">Compte Comptable</label>
                    <InputText 
                        id="compteCompta" 
                        name="compteCompta" 
                        value={primeParametre.compteCompta} 
                        onChange={handleChange} 
                        maxLength={13}
                    />
                </div>
            </div>
        </div>
    );
}

export default PrimeParametreForm;