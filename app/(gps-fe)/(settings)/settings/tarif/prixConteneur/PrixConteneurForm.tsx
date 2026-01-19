'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixConteneur } from "./PrixConteneur";

interface PrixConteneurProps {
    prixConteneur: PrixConteneur;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixConteneurForm: React.FC<PrixConteneurProps> = ({prixConteneur, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="nbreJr1">Nombre de jours Min</label>
                    <InputNumber 
                        id="nbreJr1" 
                        value={prixConteneur.nbreJr1} 
                        onValueChange={(e) => handleNumberChange("nbreJr1", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="nbreJr2">Nombre de jours Max</label>
                    <InputNumber 
                        id="nbreJr2" 
                        value={prixConteneur.nbreJr2} 
                        onValueChange={(e) => handleNumberChange("nbreJr2", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={0}
                        suffix=" jours"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix20Pieds">Prix 20 Pieds (BIF)</label>
                    <InputNumber 
                        id="prix20Pieds" 
                        value={prixConteneur.prix20Pieds} 
                        onValueChange={(e) => handleNumberChange("prix20Pieds", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix40Pieds">Prix 40 Pieds (BIF)</label>
                    <InputNumber 
                        id="prix40Pieds" 
                        value={prixConteneur.prix40Pieds} 
                        onValueChange={(e) => handleNumberChange("prix40Pieds", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixConteneurForm;