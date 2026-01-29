'use client';
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { TarifPrestation } from "./TarifPrestation";

interface TarifPrestationProps {
    tarifPrestation: TarifPrestation;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
}

const TarifPrestationForm: React.FC<TarifPrestationProps> = ({
    tarifPrestation,
    handleChange,
    handleValueChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="libellePrestation">Libellé Prestation</label>
                    <InputText
                        id="libellePrestation"
                        name="libellePrestation"
                        value={tarifPrestation.libellePrestation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="tarifSemaine">Tarif Semaine (Ar)</label>
                    <InputNumber
                        id="tarifSemaine"
                        name="tarifSemaine"
                        value={tarifPrestation.tarifSemaine}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" Ar"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="tarifFerie">Tarif Férié (Ar)</label>
                    <InputNumber
                        id="tarifFerie"
                        name="tarifFerie"
                        value={tarifPrestation.tarifFerie}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" Ar"
                    />
                </div>
            </div>
        </div>
    );
};

export default TarifPrestationForm;