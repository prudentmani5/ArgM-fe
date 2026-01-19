'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { IndemniteParametre } from "./IndemniteParametre";

interface IndemniteParametreProps {
    indemniteParametre: IndemniteParametre;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleCheckboxChange: (field: string, checked: boolean) => void;
    isEditMode?: boolean;
}

const IndemniteParametreForm: React.FC<IndemniteParametreProps> = ({
    indemniteParametre, 
    handleChange, 
    handleNumberChange,
    handleCheckboxChange,
    isEditMode = false
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4 md:col-4">
                    <label htmlFor="codeInd">Code *</label>
                    <InputText 
                        id="codeInd" 
                        name="codeInd" 
                        value={indemniteParametre.codeInd} 
                        onChange={handleChange} 
                        maxLength={5}
                        required
                        disabled={isEditMode}
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>
                <div className="field col-4 md:col-4">
                    <label htmlFor="libelleInd">Libellé *</label>
                    <InputText 
                        id="libelleInd" 
                        name="libelleInd" 
                        value={indemniteParametre.libelleInd} 
                        onChange={handleChange} 
                        maxLength={50}
                        required
                    />
                </div>
                <div className="field col-4 md:col-4">
                    <div className="flex align-items-center">
                        <Checkbox 
                            inputId="imposable" 
                            checked={indemniteParametre.imposable} 
                            onChange={(e) => handleCheckboxChange('imposable', e.checked || false)}
                        />
                        <label htmlFor="imposable" className="ml-2">Imposable</label>
                    </div>
                </div>
                <div className="field col-4 md:col-4">
                    <label htmlFor="taux">Taux *</label>
                    <InputNumber 
                        id="taux"
                        value={indemniteParametre.taux} 
                        onValueChange={(e) => handleNumberChange('taux', e.value)}
                        mode="decimal" 
                        minFractionDigits={2} 
                        maxFractionDigits={2}
                        suffix=" %"
                        required
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="compteCompta">Compte Comptable</label>
                    <InputText 
                        id="compteCompta" 
                        name="compteCompta" 
                        value={indemniteParametre.compteCompta} 
                        onChange={handleChange} 
                        maxLength={13}
                    />
                </div>
            </div>
        </div>
    );
}

export default IndemniteParametreForm;