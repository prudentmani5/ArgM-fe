'use client';

import { InputNumber } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Excedent } from "./Excedent";

interface ExcedentFormProps {
    excedent: Excedent;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleMontantExcedentChange: (value: number | null) => void; // New prop
}

const ExcedentForm: React.FC<ExcedentFormProps> = ({
    excedent,
    handleChange,
    handleValueChange,
    handleDropDownSelect,
    handleDateChange,
    handleMontantExcedentChange // New prop
}) => {
    const typeOptions = [
        { label: 'BO', value: 'BO' },
        { label: 'FA', value: 'FA' }
    ];

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="type">Type</label>
                    <Dropdown
                        id="type"
                        name="type"
                        value={excedent.type}
                        options={typeOptions}
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionnez un type"
                        className="w-full"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="dateExcedent">Date Excédent</label>
                    <Calendar
                        id="dateExcedent"
                        value={excedent.dateExcedent || new Date()}
                        onChange={(e) => handleDateChange('dateExcedent', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="montantExcedent">Montant Excédent (BIF)</label>
                    <InputNumber
                        id="montantExcedent"
                        name="montantExcedent"
                        value={excedent.montantExcedent || 0}
                        onValueChange={(e) => handleMontantExcedentChange(e.value||0)} // Use the new handler
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="montant">Montant HTVA (BIF)</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={excedent.montant || 0}
                        onValueChange={handleValueChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        readOnly // Make it read-only since it's calculated
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="tva">TVA (BIF)</label>
                    <InputNumber
                        id="tva"
                        name="tva"
                        value={excedent.tva || 0}
                        onValueChange={handleValueChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        readOnly // Make it read-only since it's calculated
                    />
                </div>
            </div>
        </div>
    );
};

export default ExcedentForm;