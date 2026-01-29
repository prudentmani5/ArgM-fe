'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixMagasin } from "./PrixMagasin";

interface PrixMagasinProps {
    prixMagasin: PrixMagasin;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixMagasinForm: React.FC<PrixMagasinProps> = ({prixMagasin, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="nbreJr1">Nombre de jours 1</label>
                    <InputNumber 
                        id="nbreJr1" 
                        value={prixMagasin.nbreJr1} 
                        onValueChange={(e) => handleNumberChange("nbreJr1", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="nbreJr2">Nombre de jours 2</label>
                    <InputNumber 
                        id="nbreJr2" 
                        value={prixMagasin.nbreJr2} 
                        onValueChange={(e) => handleNumberChange("nbreJr2", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prixSac">Prix par sac (€)</label>
                    <InputNumber 
                        id="prixSac" 
                        value={prixMagasin.prixSac} 
                        onValueChange={(e) => handleNumberChange("prixSac", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prixAutre">Prix autre (€)</label>
                    <InputNumber 
                        id="prixAutre" 
                        value={prixMagasin.prixAutre} 
                        onValueChange={(e) => handleNumberChange("prixAutre", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixMagasinForm;