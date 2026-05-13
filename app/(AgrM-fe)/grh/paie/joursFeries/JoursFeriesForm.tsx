'use client';

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { JoursFeries } from "./JoursFeries";
import { stringToDate } from "@/utils/dateUtils";

interface JoursFeriesProps {
    joursFeries: JoursFeries;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
}

const JoursFeriesForm: React.FC<JoursFeriesProps> = ({ joursFeries, handleChange, handleDateChange }) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="dateFerie">Date du jour férié</label>
                    <Calendar
                        id="dateFerie"
                        name="dateFerie"
                        value={stringToDate(joursFeries.dateFerie)}
                        onChange={(e) => handleDateChange(e.value as Date | null | undefined, "dateFerie")}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner la date"
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        type="text"
                        name="libelle"
                        value={joursFeries.libelle}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="Ex: Fête de l'indépendance"
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="description">Description (optionnel)</label>
                    <InputTextarea
                        id="description"
                        name="description"
                        value={joursFeries.description}
                        onChange={handleChange}
                        rows={3}
                        maxLength={255}
                        placeholder="Description additionnelle..."
                    />
                </div>
            </div>
        </div>
    );
}

export default JoursFeriesForm;
