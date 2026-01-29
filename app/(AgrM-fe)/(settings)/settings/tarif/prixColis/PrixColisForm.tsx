'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixColis } from "./PrixColis";

interface PrixColisProps {
    prixColis: PrixColis;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixColisForm: React.FC<PrixColisProps> = ({prixColis, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="poids1">Poids Min (kg)</label>
                    <InputNumber 
                        id="poids1" 
                        value={prixColis.poids1} 
                        onValueChange={(e) => handleNumberChange("poids1", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="poids2">Poids Max (kg)</label>
                    <InputNumber 
                        id="poids2" 
                        value={prixColis.poids2} 
                        onValueChange={(e) => handleNumberChange("poids2", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>
                
                <div className="field col-12">
                    <label htmlFor="montant">Montant (BIF)</label>
                    <InputNumber 
                        id="montant" 
                        value={prixColis.montant} 
                        onValueChange={(e) => handleNumberChange("montant", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixColisForm;