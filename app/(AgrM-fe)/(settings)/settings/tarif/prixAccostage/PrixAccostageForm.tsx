'use client';

import { InputNumber } from 'primereact/inputnumber';
import { PrixAccostage } from './PrixAccostage';

interface PrixAccostageProps {
    prixAccostage: PrixAccostage;
    handleNumberChange: (field: string, value: number | null) => void;
}

const PrixAccostageForm: React.FC<PrixAccostageProps> = ({ prixAccostage, handleNumberChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="longueur1">Longueur 1 (m)</label>
                    <InputNumber
                        id="longueur1"
                        value={prixAccostage.longueur1}
                        onValueChange={(e) => handleNumberChange("longueur1", e.value ?? null)}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" m"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="longueur2">Longueur 2 (m)</label>
                    <InputNumber
                        id="longueur2"
                        value={prixAccostage.longueur2}
                        onValueChange={(e) => handleNumberChange("longueur2", e.value ?? null)}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" m"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="montant">Montant (BIF)</label>
                    <InputNumber
                        id="montant"
                        value={prixAccostage.montant}
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

export default PrixAccostageForm;
