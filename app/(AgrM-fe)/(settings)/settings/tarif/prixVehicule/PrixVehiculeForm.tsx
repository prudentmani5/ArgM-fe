'use client';
import { InputNumber } from "primereact/inputnumber";
import { PrixVehicule } from "./PrixVehicule";

interface PrixVehiculeProps {
    prixVehicule: PrixVehicule;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
}

const PrixVehiculeForm: React.FC<PrixVehiculeProps> = ({
    prixVehicule,
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
                        value={prixVehicule.poids1}
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
                        value={prixVehicule.poids2}
                        onValueChange={handleValueChange}
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
                        name="montant"
                        value={prixVehicule.montant}
                        onValueChange={handleValueChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixVehiculeForm;