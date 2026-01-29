'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixAbonnement } from "./PrixAbonnement";

interface PrixAbonnementProps {
    prixAbonnement: PrixAbonnement;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixAbonnementForm: React.FC<PrixAbonnementProps> = ({prixAbonnement, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="poids1">Poids 1 (kg)</label>
                    <InputNumber 
                        id="poids1" 
                        value={prixAbonnement.poids1} 
                        onValueChange={(e) => handleNumberChange("poids1", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="poids2">Poids 2 (kg)</label>
                    <InputNumber 
                        id="poids2" 
                        value={prixAbonnement.poids2} 
                        onValueChange={(e) => handleNumberChange("poids2", e.value??null)} 
                        mode="decimal" 
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="montantMois">Montant Mensuel (€)</label>
                    <InputNumber 
                        id="montantMois" 
                        value={prixAbonnement.montantMois} 
                        onValueChange={(e) => handleNumberChange("montantMois", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="montantTour">Montant par Tour (€)</label>
                    <InputNumber 
                        id="montantTour" 
                        value={prixAbonnement.montantTour} 
                        onValueChange={(e) => handleNumberChange("montantTour", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixAbonnementForm;