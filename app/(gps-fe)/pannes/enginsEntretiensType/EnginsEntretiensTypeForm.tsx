'use client';

import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { EnginsEntretiensType } from "./EnginsEntretiensType";
import { PanEngin } from "./PanEngin";
import { EntretiensType } from "./EntretiensType";

interface EnginsEntretiensTypeProps {
    enginsEntretiensType: EnginsEntretiensType;
    handleChange: (e: any) => void;
    engins: PanEngin[];
    entretiensTypes: EntretiensType[];
}

const EnginsEntretiensTypeForm: React.FC<EnginsEntretiensTypeProps> = ({ 
    enginsEntretiensType, 
    handleChange,
    engins,
    entretiensTypes
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        name="enginId"
                        value={enginsEntretiensType.enginId}
                        options={engins || []}
                        onChange={handleChange}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        placeholder="Sélectionnez un engin"
                        filter
                        filterBy="enginDesignation,enginId"
                        showClear
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="entretiensTypeId">Type d'entretien</label>
                    <Dropdown
                        id="entretiensTypeId"
                        name="entretiensTypeId"
                        value={enginsEntretiensType.entretiensTypeId}
                        options={entretiensTypes}
                        onChange={handleChange}
                        optionLabel="designation"
                        optionValue="typeId"
                        placeholder="Sélectionnez un type d'entretien"
                        filter
                        showClear
                    />
                </div>
                
                <div className="field col-12">
                    <label htmlFor="periodicite">Périodicité (heures)</label>
                    <InputNumber
                        id="periodicite"
                        name="periodicite"
                        value={enginsEntretiensType.periodicite}
                        onValueChange={(e) => handleChange({
                            target: {
                                name: 'periodicite',
                                value: e.value
                            }
                        })}
                        mode="decimal"
                        min={0}
                        max={10000}
                        showButtons
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default EnginsEntretiensTypeForm;