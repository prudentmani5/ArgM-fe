'use client';

import { InputNumber } from "primereact/inputnumber";
import { PrixArrimage } from "./PrixArrimage";

interface PrixArrimageProps {
    prixArrimage: PrixArrimage;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixArrimageForm: React.FC<PrixArrimageProps> = ({ prixArrimage, handleNumberChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="poids1">Poids 1 (kg)</label>
                    <InputNumber
                        id="poids1"
                        value={prixArrimage.poids1}
                        onValueChange={(e) => handleNumberChange("poids1", e.value ?? null)}
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
                        value={prixArrimage.poids2}
                        onValueChange={(e) => handleNumberChange("poids2", e.value ?? null)}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="montant">Montant (BIF)</label>
                    <InputNumber
                        id="montant"
                        value={prixArrimage.montant}
                        onValueChange={(e) => handleNumberChange("montant", e.value ?? null)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixArrimageForm;
