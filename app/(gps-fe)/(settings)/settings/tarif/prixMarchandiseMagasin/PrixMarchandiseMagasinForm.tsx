'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixMarchandiseMagasin } from "./PrixMarchandiseMagasin";

interface PrixMarchandiseMagasinProps {
    prixMarchandiseMagasin: PrixMarchandiseMagasin;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixMarchandiseMagasinForm: React.FC<PrixMarchandiseMagasinProps> = ({prixMarchandiseMagasin, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="nbreJr1">Nombre de jours 1</label>
                    <InputNumber 
                        id="nbreJr1" 
                        value={prixMarchandiseMagasin.nbreJr1} 
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
                        value={prixMarchandiseMagasin.nbreJr2} 
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
                        value={prixMarchandiseMagasin.prixSac} 
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
                        value={prixMarchandiseMagasin.prixAutre} 
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

export default PrixMarchandiseMagasinForm;