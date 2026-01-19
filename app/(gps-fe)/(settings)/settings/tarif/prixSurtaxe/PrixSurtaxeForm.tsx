'use client';
import { InputNumber } from "primereact/inputnumber";
import { PrixSurtaxe } from "./PrixSurtaxe";

interface PrixSurtaxeProps {
    prixSurtaxe: PrixSurtaxe;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
}

const PrixSurtaxeForm: React.FC<PrixSurtaxeProps> = ({
    prixSurtaxe,
    handleChange,
    handleValueChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="poids1">Poids Min (kg)</label>
                    <InputNumber
                        id="poids1"
                        name="poids1"
                        value={prixSurtaxe.poids1}
                        onValueChange={handleValueChange}
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
                        name="poids2"
                        value={prixSurtaxe.poids2}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>

                <div className="field col-12">
                    <label htmlFor="taux">Taux de Surtaxe</label>
                    <InputNumber
                        id="taux"
                        name="taux"
                        value={prixSurtaxe.taux}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" %"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixSurtaxeForm;