'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixMarchandiseMagasinTransit } from "./PrixMarchandiseMagasinTransit";

interface PrixMarchandiseMagasinTransitProps {
    prixMarchandiseMagasinTransit: PrixMarchandiseMagasinTransit;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixMarchandiseMagasinTransitForm: React.FC<PrixMarchandiseMagasinTransitProps> = ({prixMarchandiseMagasinTransit, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="nbreJr1">Nombre de jours 1</label>
                    <InputNumber 
                        id="nbreJr1" 
                        value={prixMarchandiseMagasinTransit.nbreJr1} 
                        onValueChange={(e) => handleNumberChange("nbreJr1", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                        required
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="nbreJr2">Nombre de jours 2</label>
                    <InputNumber 
                        id="nbreJr2" 
                        value={prixMarchandiseMagasinTransit.nbreJr2} 
                        onValueChange={(e) => handleNumberChange("nbreJr2", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                        required
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prixSac">Prix par sac (BIF)</label>
                    <InputNumber 
                        id="prixSac" 
                        value={prixMarchandiseMagasinTransit.prixSac} 
                        onValueChange={(e) => handleNumberChange("prixSac", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                        required
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prixAutre">Prix autre (BIF)</label>
                    <InputNumber 
                        id="prixAutre" 
                        value={prixMarchandiseMagasinTransit.prixAutre} 
                        onValueChange={(e) => handleNumberChange("prixAutre", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixMarchandiseMagasinTransitForm;